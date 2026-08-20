import { CustomerForm } from "../_components/customer-form";
import {
  customerCategoryOptions,
  customerTypeOptions,
  meterPhaseOptions,
  meterTypeOptions,
  premiseTypeOptions,
  serviceCenterOptions,
} from "../_lib/customer-enums";

export default function AddNewCustomerPage() {
  return (
    <CustomerForm
      mode="create"
      customerTypeOptions={customerTypeOptions}
      meterTypeOptions={meterTypeOptions}
      meterPhaseOptions={meterPhaseOptions}
      customerCategoryOptions={customerCategoryOptions}
      premiseTypeOptions={premiseTypeOptions}
      serviceCenterOptions={serviceCenterOptions}
    />
  );
}
