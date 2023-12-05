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

use frame_support::{pallet_prelude::*, parameter_types};
use frame_system::pallet_prelude::*;
use sp_core::{sr25519, H256};
use sp_runtime::traits::{IdentifyAccount, Verify};

parameter_types! {
	pub MaxTokenLength: u32 = 256;
}

pub struct Token<Signature: Verify>
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

impl<Signature> Token<Signature>
where
	Signature: Verify + Parameter + From<sr25519::Signature>,
	<Signature::Signer as IdentifyAccount>::AccountId: Parameter,
{
	pub fn parse(token: &[u8]) -> Result<Self, u8> {
		if token.len() < 192 {
			return Err(0);
		}
		let oracle_block = u32::from_le_bytes(token[0..4].try_into().unwrap());
		let difficulty = u32::from_le_bytes(token[4..8].try_into().unwrap());
		let no_redeem_before_block = u32::from_le_bytes(token[8..12].try_into().unwrap());
		let value_if_paid = u32::from_le_bytes(token[12..16].try_into().unwrap());
		let price_list_commit = u128::from_le_bytes(token[16..32].try_into().unwrap());
		let sender_pk = <<Signature::Signer as IdentifyAccount>::AccountId as Decode>::decode(
			&mut &token[32..64],
		)
		.map_err(|_e| 1)?;
		let recipient_pk = <<Signature::Signer as IdentifyAccount>::AccountId as Decode>::decode(
			&mut &token[64..96],
		)
		.map_err(|_e| 2)?;
		let nonce = H256::from_slice(&token[96..128]);
		let signature = <sr25519::Signature as Decode>::decode(&mut &token[128..192])
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
	pub trait Config: frame_system::Config {
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

		type Signature: Verify + From<sr25519::Signature>;

		type BlockNumber: From<u32>;

		/// Type representing the weight of this pallet
		type WeightInfo: WeightInfo;
	}

	// The pallet's runtime storage items.
	// https://docs.substrate.io/main-docs/build/runtime-storage/
	#[pallet::storage]
	#[pallet::getter(fn something)]
	// Learn more about declaring storage items:
	// https://docs.substrate.io/main-docs/build/runtime-storage/#declaring-storage-items
	pub type Something<T> = StorageValue<_, u32>;

	// Pallets use events to inform users when important changes are made.
	// https://docs.substrate.io/main-docs/build/events-errors/
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// A token was claimed successfully. [value, who]
		TokenClaimed { value: u32, who: T::AccountId },
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		/// Token cannot be parsed from the given amount of bytes.
		InvalidToken(u8),
		/// Only the recipient of the token can claim the value.
		InvalidRecipient,
		/// The token is not signed by the sender properly.
		InvalidTokenSignature,
		/// The token cannot be claimed yet.
		TooSoon,
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
	{
		/// An example dispatchable that takes a singles value as a parameter, writes the value to
		/// storage and emits an event. This function must be dispatched by a signed extrinsic.
		#[pallet::call_index(0)]
		#[pallet::weight(T::WeightInfo::claim())]
		pub fn claim(
			origin: OriginFor<T>,
			token: BoundedVec<u8, MaxTokenLength>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let tkn = Token::<<T as Config>::Signature>::parse(token.as_ref())
				.map_err(|c| Error::<T>::InvalidToken(c))?;

			ensure!(tkn.recipient_pk == who, Error::<T>::InvalidRecipient);
			ensure!(
				<frame_system::Pallet<T>>::block_number() >= tkn.no_redeem_before_block,
				Error::<T>::TooSoon
			);

			ensure!(
				tkn.signature.verify(&AsRef::<[_]>::as_ref(&token)[0..128], &tkn.sender_pk),
				Error::<T>::InvalidTokenSignature
			);

			Self::deposit_event(Event::TokenClaimed { value: tkn.value_if_paid, who });

			// Return a successful DispatchResultWithPostInfo
			Ok(())
		}
	}
}
