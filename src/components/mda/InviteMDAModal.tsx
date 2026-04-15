import { useEffect, useMemo, useState } from 'react';
import { Building2, Mail, ShieldPlus } from 'lucide-react';
import { InviteMDAPayload, MDACollectionCode, MDARecord, MDAServiceCode } from '../../types/mda';
import { validateEmail } from '../../utils/validators';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface InviteMDAModalProps {
  open: boolean;
  mdas: MDARecord[];
  defaultMDAId?: string | null;
  isSubmitting?: boolean;
  loadMDACollections: (mdaId: string) => Promise<MDACollectionCode[]>;
  loadMDAServiceCodes: (mdaId: string) => Promise<MDAServiceCode[]>;
  onClose: () => void;
  onSubmit: (payload: InviteMDAPayload) => Promise<void>;
}

const buildInitialValues = (mdaId?: string | null): InviteMDAPayload => ({
  email: '',
  mdaId: mdaId ?? '',
  collectionCode: '',
  serviceCode: '',
});

export function InviteMDAModal({
  open,
  mdas,
  defaultMDAId,
  isSubmitting = false,
  loadMDACollections,
  loadMDAServiceCodes,
  onClose,
  onSubmit,
}: InviteMDAModalProps) {
  const [values, setValues] = useState<InviteMDAPayload>(() => buildInitialValues(defaultMDAId));
  const [collectionCodes, setCollectionCodes] = useState<MDACollectionCode[]>([]);
  const [serviceCodes, setServiceCodes] = useState<MDAServiceCode[]>([]);
  const [isLoadingScope, setIsLoadingScope] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof InviteMDAPayload, string>>>({});

  const selectedMDA = useMemo(
    () => mdas.find((entry) => entry.id === values.mdaId) ?? null,
    [mdas, values.mdaId],
  );

  useEffect(() => {
    if (!open) {
      setValues(buildInitialValues(defaultMDAId));
      setCollectionCodes([]);
      setServiceCodes([]);
      setIsLoadingScope(false);
      setSubmitError(null);
      setFieldErrors({});
      return;
    }

    setValues((current) => buildInitialValues(current.mdaId || defaultMDAId));
  }, [defaultMDAId, open]);

  useEffect(() => {
    if (!open || !values.mdaId) {
      setCollectionCodes([]);
      setServiceCodes([]);
      return;
    }

    let isMounted = true;

    async function fetchScopeOptions() {
      setIsLoadingScope(true);
      setSubmitError(null);

      try {
        const [nextCollections, nextServices] = await Promise.all([
          loadMDACollections(values.mdaId),
          loadMDAServiceCodes(values.mdaId),
        ]);

        if (!isMounted) return;
        setCollectionCodes(nextCollections);
        setServiceCodes(nextServices);
      } catch (caughtError) {
        if (!isMounted) return;
        setCollectionCodes([]);
        setServiceCodes([]);
        setSubmitError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load MDA scope options right now.',
        );
      } finally {
        if (isMounted) setIsLoadingScope(false);
      }
    }

    void fetchScopeOptions();

    return () => {
      isMounted = false;
    };
  }, [loadMDACollections, loadMDAServiceCodes, open, values.mdaId]);

  function updateValue<K extends keyof InviteMDAPayload>(key: K, value: InviteMDAPayload[K]) {
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === 'mdaId' ? { collectionCode: '', serviceCode: '' } : null),
    }));
    setSubmitError(null);
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit() {
    const emailError = validateEmail(values.email);
    const nextFieldErrors: Partial<Record<keyof InviteMDAPayload, string>> = {
      email: emailError ?? undefined,
      mdaId: values.mdaId ? undefined : 'MDA is required.',
      collectionCode: values.collectionCode ? undefined : 'Collection code is required.',
      serviceCode: values.serviceCode ? undefined : 'Service code is required.',
    };

    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.email || nextFieldErrors.mdaId || nextFieldErrors.collectionCode || nextFieldErrors.serviceCode) {
      return;
    }

    try {
      await onSubmit({
        email: values.email.trim().toLowerCase(),
        mdaId: values.mdaId,
        collectionCode: values.collectionCode,
        serviceCode: values.serviceCode,
      });
      onClose();
    } catch (caughtError) {
      setSubmitError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to invite MDA user right now.',
      );
    }
  }

  return (
    <Modal
      open={open}
      title="Invite MDA user"
      description="Send a role-scoped portal invitation tied to an MDA, one collection code, and one service code."
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

        <Select
          label="MDA"
          value={values.mdaId}
          error={fieldErrors.mdaId}
          options={[
            { label: 'Select MDA', value: '' },
            ...mdas.map((mda) => ({
              label: `${mda.mdaCode} — ${mda.mdaName}`,
              value: mda.id,
            })),
          ]}
          onChange={(event) => updateValue('mdaId', event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Collection code"
            value={values.collectionCode}
            error={fieldErrors.collectionCode}
            disabled={!values.mdaId || isLoadingScope}
            hint={values.mdaId && isLoadingScope ? 'Loading MDA collections...' : undefined}
            options={[
              {
                label: values.mdaId ? 'Select collection code' : 'Choose an MDA first',
                value: '',
              },
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
            disabled={!values.mdaId || isLoadingScope}
            hint={values.mdaId && isLoadingScope ? 'Loading MDA service codes...' : undefined}
            options={[
              {
                label: values.mdaId ? 'Select service code' : 'Choose an MDA first',
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

        {selectedMDA && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white p-2 text-[#E8001C]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-950">{selectedMDA.mdaName}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Invitations created here are restricted to {selectedMDA.mdaCode} plus one collection code and one service code.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
