use frame_support::{assert_ok, pallet_prelude::*};
use hex_literal::hex;
use sp_core::{bounded::TryCollect, sr25519, Decode, Pair, H256};
use sp_runtime::{codec::Encode, traits::IdentifyAccount, MultiSigner};

use crate::{mock::*, Event};

#[test]
fn claim_works_for_given_values() {
	new_test_ext().execute_with(|| {
		let alice =
			sp_core::sr25519::Pair::from_string("//Alice", None).expect("constant should work");
		let bob = sp_core::sr25519::Pair::from_string("//Bob", None).expect("constant should work");
		let alice_pub: MultiSigner = alice.public().into();
		let bob_pub: MultiSigner = bob.public().into();

		// We need a RandomnessHistory entry for the oracle block
		System::set_block_number(1);
		<InsecureRandomnessCollectiveFlip as Hooks<_>>::on_initialize(1);
		<ProbabilisticPayments as Hooks<_>>::on_initialize(1);

		// Needs to be past the
		System::set_block_number(10);

		let mut unsigned_voucher_bytes = vec![];
		// oracle_block
		unsigned_voucher_bytes.extend_from_slice(&1u32.encode());
		// difficulty
		unsigned_voucher_bytes.extend_from_slice(&2u32.encode());
		// no_redeem_before_block
		unsigned_voucher_bytes.extend_from_slice(&3u32.encode());
		// value_if_paid
		unsigned_voucher_bytes.extend_from_slice(&4u32.encode());
		// price_list_commit
		unsigned_voucher_bytes.extend(hex!("fedcba98765432100123456789abcdef"));
		// sender_pk
		unsigned_voucher_bytes.extend_from_slice(&bob_pub.clone().into_account().encode());
		// recipient_pk
		unsigned_voucher_bytes.extend_from_slice(&alice_pub.clone().into_account().encode());
		// nonce
		unsigned_voucher_bytes.extend_from_slice(&H256::default().encode());

		let test_signature = bob.sign(&unsigned_voucher_bytes).encode();
		let voucher_bytes =
			unsigned_voucher_bytes.iter().chain(&test_signature).cloned().collect::<Vec<_>>();

		println!(
			"{}+{}: {}",
			unsigned_voucher_bytes.len(),
			test_signature.len(),
			hex::encode(&voucher_bytes)
		);
		// Dispatch a signed extrinsic.
		assert_ok!(ProbabilisticPayments::claim(
			RuntimeOrigin::signed(alice_pub.clone().into_account()),
			voucher_bytes.into_iter().try_collect().unwrap()
		));

		// Assert that the correct event was deposited
		System::assert_last_event(
			Event::VoucherClaimed { value: 4, who: alice_pub.into_account() }.into(),
		);
	});
}

#[test]
fn signature_parsing_works() {
	new_test_ext().execute_with(|| {
		let sig_bytes: [u8; 64] = hex!("68c55958d16c8ea9cb283e99b16fd5a4f8a60cb2fad3bedb7731004922282f1495c960156450fc076d957606dc62bc925433853d4d81038a5ed4245d496d1e8d");
		let _sig = <sr25519::Signature as Decode>::decode(&mut &sig_bytes[..]).unwrap();
	});
}

#[test]
#[ignore = "JS signing is not perfect yet"]
fn claim_works_for_test_vector() {
	new_test_ext().execute_with(|| {
		let _sender_pub = <sr25519::Public as Decode>::decode(&mut &hex!("d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d")[..]).unwrap();
		let recipient_pub = <sr25519::Public as Decode>::decode(&mut &hex!("d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d")[..]).unwrap();
		let voucher_bytes: [u8; 192] = hex!("
			00001800
			00001388
			65682048
			00003039
			ba1149929099a1c820e4baa3be7c72ad
			d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d
			d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d
			a93124266cc3860edc492483e6fae43b0eaf53497f582fdd909b8ead81e4cc40
			8e8e7ec4f0a87263ba762a08f4ae377ee070d5abb96d1d9049ac13f4a3744c4b4eaf88d53d24afc9a6b4f33ee2522264f0de185254ce20bc689ab5b4050cf681
		");
		System::set_block_number(u32::from_le_bytes(hex!("65682048")) + 1);

		assert_ok!(ProbabilisticPayments::claim(
			RuntimeOrigin::signed(recipient_pub.into()),
			voucher_bytes.into_iter().try_collect().unwrap()
		));
		
		System::assert_last_event(
			Event::VoucherClaimed { value: 4, who: recipient_pub.into() }.into(),
		);
	});
}
