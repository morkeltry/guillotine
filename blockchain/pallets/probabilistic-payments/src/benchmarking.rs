//! Benchmarking setup for pallet-template

use frame_benchmarking::v2::*;
use frame_system::RawOrigin;

#[allow(unused)]
use crate::Pallet as ProbabilisticPayments;

use super::*;

#[benchmarks]
mod benchmarks {
	use super::*;

	#[benchmark]
	fn claim() {
		let token = BoundedVec::<_, _>::default();
		let caller: T::AccountId = whitelisted_caller();

		#[extrinsic_call]
		claim(RawOrigin::Signed(caller), token);
	}

	impl_benchmark_test_suite!(
		ProbabilisticPayments,
		crate::mock::new_test_ext(),
		crate::mock::Test
	);
}
