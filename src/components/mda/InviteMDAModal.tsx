import { useEffect, useMemo, useState } from 'react';
import { Building2, Mail, ShieldPlus } from 'lucide-react';
import { CollectionCode, InviteMDAPayload, ServiceCode } from '../../types/mda';
import { validateEmail } from '../../utils/validators';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface InviteMDAModalProps {
  open: boolean;
  collectionCodes: CollectionCode[];
  isSubmitting?: boolean;
  loadServiceCodes: (collectionCode: string) => Promise<ServiceCode[]>;
  onClose: () => void;
  onSubmit: (payload: InviteMDAPayload) => Promise<void>;
}

const initialValues: InviteMDAPayload = {
  email: '',
  collectionCode: '',
  serviceCode: '',
};

export function InviteMDAModal({
  open,
  collectionCodes,
  isSubmitting = false,
  loadServiceCodes,
  onClose,
  onSubmit,
}: InviteMDAModalProps) {
  const [values, setValues] = useState<InviteMDAPayload>(initialValues);
  const [serviceCodes, setServiceCodes] = useState<ServiceCode[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof InviteMDAPayload, string>>>({});

  const selectedCollection = useMemo(
    () => collectionCodes.find((collection) => collection.code === values.collectionCode) ?? null,
    [collectionCodes, values.collectionCode]
  );

  useEffect(() => {
    if (!open) {
      setValues(initialValues);
      setServiceCodes([]);
      setIsLoadingServices(false);
      setSubmitError(null);
      setFieldErrors({});
      return;
    }

    if (!values.collectionCode) {
      setServiceCodes([]);
      return;
    }

    let isMounted = true;

    async function fetchServiceCodes() {
      setIsLoadingServices(true);
      try {
        const response = await loadServiceCodes(values.collectionCode);
        if (isMounted) setServiceCodes(response);
      } catch (caughtError) {
        if (isMounted) {
          setServiceCodes([]);
          setSubmitError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load service codes right now.'
          );
        }
      } finally {
        if (isMounted) setIsLoadingServices(false);
      }
    }

    void fetchServiceCodes();

    return () => {
      isMounted = false;
    };
  }, [loadServiceCodes, open, values.collectionCode]);

  function updateValue<K extends keyof InviteMDAPayload>(key: K, value: InviteMDAPayload[K]) {
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === 'collectionCode' ? { serviceCode: '' } : null),
    }));
    setSubmitError(null);
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit() {
    const emailError = validateEmail(values.email);
    const nextFieldErrors: Partial<Record<keyof InviteMDAPayload, string>> = {
      email: emailError ?? undefined,
      collectionCode: values.collectionCode ? undefined : 'Collection code is required.',
      serviceCode: values.serviceCode ? undefined : 'Service code is required.',
    };

    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.email || nextFieldErrors.collectionCode || nextFieldErrors.serviceCode) {
      return;
    }

    try {
      await onSubmit({
        email: values.email.trim().toLowerCase(),
        collectionCode: values.collectionCode,
        serviceCode: values.serviceCode,
      });
      onClose();
    } catch (caughtError) {
      setSubmitError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to invite MDA user right now.'
      );
    }
  }

  return (
    <Modal
      open={open}
      title="Invite MDA user"
      description="Send a role-scoped portal invitation tied to a collection code and service code."
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            isLoading={isSubmitting}
            leftIcon={<ShieldPlus className="h-4 w-4" />}
            onClick={() => void handleSubmit()}
          >
            Send invitation
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {submitError && <Alert variant="error" message={submitError} />}

        <Input
          label="Email address"
          type="email"
          value={values.email}
          error={fieldErrors.email}
          leftAddon={<Mail className="h-4 w-4" />}
          placeholder="user@mda.gov.ng"
          onChange={(event) => updateValue('email', event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Collection code"
            value={values.collectionCode}
            error={fieldErrors.collectionCode}
            options={[
              { label: 'Select collection code', value: '' },
              ...collectionCodes.map((collection) => ({
                label: `${collection.code} — ${collection.name}`,
                value: collection.code,
              })),
            ]}
            onChange={(event) => updateValue('collectionCode', event.target.value)}
          />
          <Select
            label="Service code"
            value={values.serviceCode}
            error={fieldErrors.serviceCode}
            disabled={!values.collectionCode || isLoadingServices}
            hint={values.collectionCode && isLoadingServices ? 'Loading service codes...' : undefined}
            options={[
              {
                label: values.collectionCode ? 'Select service code' : 'Choose a collection first',
                value: '',
              },
              ...serviceCodes.map((serviceCode) => ({
                label: `${serviceCode.code} — ${serviceCode.name}`,
                value: serviceCode.code,
              })),
            ]}
            onChange={(event) => updateValue('serviceCode', event.target.value)}
          />
        </div>

        {selectedCollection && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white p-2 text-[#E8001C]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-950">{selectedCollection.name}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Invitations created here are restricted to collection code {selectedCollection.code}.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
