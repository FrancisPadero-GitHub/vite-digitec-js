import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {Toaster, toast} from 'react-hot-toast';

// redux stuff
import { useSelector, useDispatch } from 'react-redux';
import { openModal, editModal, closeModal, modalData } from '../../features/redux/modalStateSlice';

// fetch hook
import { useFetchLoanProducts } from '../../backend/hooks/shared/useFetchLoanProduct';

// mutation hook
import { useAddLoanProduct } from '../../backend/hooks/treasurer/useAddLoanProduct';
import { useEditLoanProducts } from '../../backend/hooks/treasurer/useEditLoanProducts';

// components
import Products from './components/Products';
import FormModal from './modals/FormModal';

// Default form values - defined outside component so it's created only once
const defaultValues = {
  product_id: "",
  name: "",
  interest_method: "",
  interest_rate: "",
  penalty_rate: "",
  service_fee: "",
  repayment_freq: "",
  min_amount: "",
  max_amount: "",
  min_term_months: "",
  max_term_months: "",
};

function LoanProducts() {
  // redux stuff
  const dispatch = useDispatch();
  const modalState = useSelector(modalData)
  const state = modalState.isOpen;
  const action = modalState.type;
  //const redux_data = modalState.data; // unused
  
  // hooks stuff
  const { data: loanProducts, isLoading, error } = useFetchLoanProducts();
  const data = loanProducts || [];


  // mutation hook
  const { mutate: addLoanProduct, isPending: isAdding } = useAddLoanProduct();
  const { mutate: editLoanProduct, isPending: isEditing } = useEditLoanProducts();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues,
  });
  

  // Form handlers
  const loanProductOpenModal = () => {
    reset(defaultValues);
    dispatch(openModal({ type: 'add', data: null }));
  };

  // Store the product in the redux state and reset the form with product data
  const loanProductEditModal = useCallback((product) => {
    dispatch(editModal({ type: 'edit', data: product }));     // for now the data is stored in redux
    reset(product);
  }, [dispatch, reset]);

  const loanProductCloseModal = () => {
    reset(defaultValues)
    dispatch(closeModal());
  };

  const loanProductSubmitForm = (formData) => {
    const payload = { ...formData };


    // converting numeric fields to numbers
    const numericFields = [
      "interest_rate",
      "penalty_rate",
      "service_fee",
      "min_amount",
      "max_amount",
      "max_term_months",
    ];
    numericFields.forEach((f) => {
        if (payload[f] !== undefined && payload[f] !== "") payload[f] = Number(payload[f]);
      });

    if (action === 'add') {
      addLoanProduct(payload, {
        onSuccess: () => {
          toast.success("Loan product added successfully!");
          loanProductCloseModal();
        },
        onError: (error) => {
          toast.error("Failed to add loan product");
          console.error("Error adding loan product:", error);
        },
      });
    } else {
      editLoanProduct(payload, {
        onSuccess: () => {
          toast.success("Loan product updated successfully!");
          loanProductCloseModal();
        },
        onError: (error) => {
          toast.error("Failed to update loan product");
          console.error("Error updating loan product:", error);
        },
      });
    }
  };

  // Form button control - disable submit if adding/editing or no changes made
  const submitDisabled = isAdding || isEditing || (action === "edit" && !isDirty);


  const fields = [
    { label: "Loan Name", name: "name", type: "text" },

    {
      label: "Interest Method",
      name: "interest_method",
      type: "select",
      options: [
        { label: "Flat Rate", value: "flat" },
        { label: "Diminishing Rate", value: "diminishing" }
      ],
    },

    { label: "Interest Rate (%)", name: "interest_rate", type: "number" },
    { label: "Penalty Rate (%)", name: "penalty_rate", type: "number" },
    { label: "Service Fee (%)", name: "service_fee", type: "number" },

    {
      label: "Repayment Frequency",
      name: "repayment_freq",
      type: "select",
      options: [
        { label: "Monthly", value: "Monthly" },
        { label: "Bi-Monthly", value: "Bi-Monthly" },
        { label: "Weekly", value: "Weekly" },
      ],
    },

    { label: "Minimum Amount (₱)", name: "min_amount", type: "number" },
    { label: "Maximum Amount (₱)", name: "max_amount", type: "number" },
    { label: "Minimum Term (Months)", name: "min_term_months", type: "number" },
    { label: "Maximum Term (Months)", name: "max_term_months", type: "number" },
  ];


  // console.log("Redux Data Stored:", redux_data)
  return (
    <div>
      <Toaster position='bottom-left' />
      <div className="mb-6 space-y-4">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Loan Products</h1>

            <button className="btn btn-neutral whitespace-nowrap" onClick={loanProductOpenModal}>
              + Add Loan Product
            </button>

        </div>

        <div className="w-full grid gap-4 grid-cols-2">
          <Products
            data={data}
            isLoading={isLoading}
            isError={!!error}
            error={error}
            onEdit={loanProductEditModal}
          />
        </div>

        <FormModal
          table="Loan Products"
          open={state}
          close={loanProductCloseModal}
          action={action === "edit"}
          onSubmit={handleSubmit(loanProductSubmitForm)}
          isPending={isAdding || isEditing}
          status={submitDisabled} // disable submit if no changes made
          deleteAction={() => (toast.error("Temporary disabled"))}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(({ label, name, type, options, autoComplete }) => (
              <div key={name} className="form-control w-full">
                <label htmlFor={name} className="label text-sm font-semibold mb-2">
                  {label}
                </label>

                {/* Handle select dropdowns */}
                {type === "select" ? (
                  // Handle dropdowns
                  <select
                    id={name}
                    autoComplete={autoComplete}
                    {...register(name, { required: `${label} is required` })}
                    className="select select-bordered w-full"
                  >
                    <option value="" disabled>
                      Select {label}
                    </option>
                    {options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : type === "number" ? (
                  // Handle all number inputs with decimal support
                  <>
                    <input
                      id={name}
                      type="number"
                      step="0.01"
                      autoComplete={autoComplete}
                      placeholder={`Enter ${label}`}
                      {...register(name, { 
                        required: `${label} is required`,
                        min: { value: 0, message: `${label} must be 0 or greater` }
                      })}
                      className={`input input-bordered w-full ${
                        errors[name] ? "input-error" : ""
                      }`}
                    />
                    {errors[name] && (
                      <span className="text-sm text-error mt-1 block">
                        {errors[name]?.message}
                      </span>
                    )}
                  </>
                ) : (
                  // Handle all other input types (text, etc.)
                  <>
                    <input
                    id={name}
                    type={type}
                    autoComplete={autoComplete}
                    placeholder={`Enter ${label}`}
                    {...register(name, { required: `${label} is required` })}
                    className="input input-bordered w-full"
                    
                    />
                    {errors[name] && (
                      <span className="text-sm text-error mt-1 block">
                        {errors[name]?.message}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </FormModal>
     </div>
    </div>
  );
}

export default LoanProducts;
