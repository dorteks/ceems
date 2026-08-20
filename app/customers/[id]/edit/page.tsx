import { notFound } from "next/navigation";

import { CustomerForm } from "../../_components/customer-form";
import {
  customerCategoryOptions,
  customerTypeOptions,
  meterPhaseOptions,
  meterTypeOptions,
  premiseTypeOptions,
  serviceCenterOptions,
} from "../../_lib/customer-enums";
import {
  customerToFormValues,
  EMPTY_CUSTOMER_FORM,
} from "../../_lib/customer-form";
import { getCustomerById } from "../../../../server/services/customerService";

type EditCustomerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const { id } = await params;
  const customerId = Number(id);

  if (!Number.isInteger(customerId)) {
    notFound();
  }

  const customer = await getCustomerById(customerId);

  if (!customer) {
    notFound();
  }

  return (
    <CustomerForm
      mode="edit"
      customerId={id}
      initialValues={customerToFormValues(customer) ?? EMPTY_CUSTOMER_FORM}
      customerTypeOptions={customerTypeOptions}
      meterTypeOptions={meterTypeOptions}
      meterPhaseOptions={meterPhaseOptions}
      customerCategoryOptions={customerCategoryOptions}
      premiseTypeOptions={premiseTypeOptions}
      serviceCenterOptions={serviceCenterOptions}
    />
  );
}
