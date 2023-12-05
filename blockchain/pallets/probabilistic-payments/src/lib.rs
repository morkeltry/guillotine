#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;
pub mod weights;
pub use weights::*;

use frame_support::{pallet_prelude::*, parameter_types, StorageHasher, traits::Randomness};
use frame_system::pallet_prelude::*;
use sp_core::{sr25519, H256, U256};
use sp_runtime::{traits::{IdentifyAccount, Verify}, codec::EncodeLike, scale_info::prelude::vec::Vec, Saturating};

pub const EPOCH_LENGTH: u32 = 1024;

parameter_types! {
	pub MaxVoucherLength: u32 = 256;	
}

pub struct Voucher<Signature: Verify>
where
	Signature: Verify + Parameter + From<sr25519::Signature>,
	<Signature::Signer as IdentifyAccount>::AccountId: Parameter,
{
	pub oracle_block: u32,
	pub difficulty: u32,
	pub no_redeem_before_block: u32,
	pub value_if_paid: u32,
	pub price_list_commit: u128,
	pub sender_pk: <Signature::Signer as IdentifyAccount>::AccountId,
	pub recipient_pk: <Signature::Signer as IdentifyAccount>::AccountId,
	/// h(h(url)), but the runtime does not need to know
	pub nonce: H256,
	pub signature: Signature,
}

impl<Signature> Voucher<Signature>
where
	Signature: Verify + Parameter + From<sr25519::Signature>,
	<Signature::Signer as IdentifyAccount>::AccountId: Parameter,
{
	pub fn parse(voucher: &[u8]) -> Result<Self, u8> {
		if voucher.len() < 192 {
			return Err(0);
		}
		let oracle_block = u32::from_le_bytes(voucher[0..4].try_into().unwrap());
		let difficulty = u32::from_le_bytes(voucher[4..8].try_into().unwrap());
		let no_redeem_before_block = u32::from_le_bytes(voucher[8..12].try_into().unwrap());
		let value_if_paid = u32::from_le_bytes(voucher[12..16].try_into().unwrap());
		let price_list_commit = u128::from_le_bytes(voucher[16..32].try_into().unwrap());
		let sender_pk = <<Signature::Signer as IdentifyAccount>::AccountId as Decode>::decode(
			&mut &voucher[32..64],
		)
		.map_err(|_e| 1)?;
		let recipient_pk = <<Signature::Signer as IdentifyAccount>::AccountId as Decode>::decode(
			&mut &voucher[64..96],
		)
		.map_err(|_e| 2)?;
		let nonce = H256::from_slice(&voucher[96..128]);
		let signature = <sr25519::Signature as Decode>::decode(&mut &voucher[128..192])
			.map_err(|_e| 3)?
			.into();

		Ok(Self {
			oracle_block,
			difficulty,
			no_redeem_before_block,
			value_if_paid,
			price_list_commit,
			sender_pk,
			recipient_pk,
			nonce,
			signature,
		})
	}
}

#[frame_support::pallet]
pub mod pallet {
	use super::*;

	#[pallet::pallet]
	pub struct Pallet<T>(_);

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config:
		frame_system::Config + pallet_insecure_randomness_collective_flip::Config
	{
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

		type Signature: Verify + From<sr25519::Signature>;

		type BlockNumber: From<u32> + EncodeLike<u32>;

		/// Type representing the weight of this pallet
		type WeightInfo: WeightInfo;
	}

	// The pallet's runtime storage items.
	// https://docs.substrate.io/main-docs/build/runtime-storage/
	#[pallet::storage]
	#[pallet::getter(fn something)]
	// Learn more about declaring storage items:
	// https://docs.substrate.io/main-docs/build/runtime-storage/#declaring-storage-items
	pub type RandomnessHistory<T> = StorageMap<_, Blake2_256, BlockNumberFor<T>, <T as frame_system::Config>::Hash, OptionQuery>;

	// Pallets use events to inform users when important changes are made.
	// https://docs.substrate.io/main-docs/build/events-errors/
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// A voucher was claimed successfully. [value, who]
		VoucherClaimed { value: u32, who: T::AccountId },
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		/// Voucher cannot be parsed from the given amount of bytes.
		InvalidVoucher(u8),
		/// Only the recipient of the voucher can claim the value.
		InvalidRecipient,
		/// The voucher is not signed by the sender properly.
		InvalidVoucherSignature,
		/// The voucher cannot be claimed at this block number.
		ClaimedTooSoonOrLate,
		/// The voucher cannot be claimed yet.
		VoucherDidNotWin,
	}

	#[pallet::hooks]
	impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
		fn on_initialize(n: BlockNumberFor<T>) -> Weight {
			let mut topic = Vec::<u8>::with_capacity(3 + n.encoded_size() + 3);
			n.encode_to(&mut topic);
			topic.extend_from_slice("🎲👛".as_bytes());
			let (rand, _) = <pallet_insecure_randomness_collective_flip::Pallet::<T> as Randomness<<T as frame_system::Config>::Hash, BlockNumberFor<T>>>::random(&topic);
			RandomnessHistory::<T>::set(n, Some(rand));

			let expired = n.saturating_sub(BlockNumberFor::<T>::from(EPOCH_LENGTH));
			if expired > BlockNumberFor::<T>::default() {
				RandomnessHistory::<T>::set(expired, None);
			}

			T::DbWeight::get().reads_writes(1, 2)
		}
	}

	// Dispatchable functions allows users to interact with the pallet and invoke state changes.
	// These functions materialize as "extrinsics", which are often compared to transactions.
	// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
	#[pallet::call]
	impl<T: Config> Pallet<T>
	where
		<T as Config>::Signature: Parameter,
		<<<T as Config>::Signature as Verify>::Signer as IdentifyAccount>::AccountId: Parameter,
		<<<T as Config>::Signature as Verify>::Signer as IdentifyAccount>::AccountId:
			core::cmp::PartialEq<<T as frame_system::Config>::AccountId>,
		BlockNumberFor<T>: core::cmp::PartialOrd<u32>,
		u32: EncodeLike<BlockNumberFor<T>>
	{
		/// An example dispatchable that takes a singles value as a parameter, writes the value to
		/// storage and emits an event. This function must be dispatched by a signed extrinsic.
		#[pallet::call_index(0)]
		#[pallet::weight(T::WeightInfo::claim())]
		pub fn claim(
			origin: OriginFor<T>,
			voucher: BoundedVec<u8, MaxVoucherLength>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let v = Voucher::<<T as Config>::Signature>::parse(voucher.as_ref())
				.map_err(|c| Error::<T>::InvalidVoucher(c))?;

			ensure!(v.recipient_pk == who, Error::<T>::InvalidRecipient);
			ensure!(
				<frame_system::Pallet<T>>::block_number() >= v.no_redeem_before_block,
				Error::<T>::ClaimedTooSoonOrLate
			);
			let unsigned_voucher = &AsRef::<[_]>::as_ref(&voucher)[0..128];
			ensure!(
				v.signature.verify(unsigned_voucher, &v.sender_pk),
				Error::<T>::InvalidVoucherSignature
			);

			let rand = RandomnessHistory::<T>::get(v.oracle_block).ok_or(Error::<T>::ClaimedTooSoonOrLate)?;
			let mut input = [0u8; 128 + 32];
			input[0..128].copy_from_slice(unsigned_voucher);
			let rand = rand.encode();
			input[128..160].copy_from_slice(&rand[..]);
			let hash = <Blake2_256 as StorageHasher>::hash(input.as_ref());

			ensure!(U256::from_little_endian(&hash[..]) < U256::MAX / U256::from(v.difficulty), Error::<T>::VoucherDidNotWin);

			Self::deposit_event(Event::VoucherClaimed { value: v.value_if_paid, who });

			// Return a successful DispatchResultWithPostInfo
			Ok(())
		}
	}
}
