import { useEffect, useMemo, useState } from 'react';
import { Building2, ExternalLink, Mail, ShieldPlus } from 'lucide-react';
import { InviteMDAPayload, MDACollectionCode, MDARecord, MDAServiceCode } from '../../types/mda';
import { validateEmail } from '../../utils/validators';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { SearchableDropdown } from '../ui/SearchableDropdown';
import { useToast } from '../../context/ToastContext';

interface InviteMDAModalProps {
  open: boolean;
  mdas: MDARecord[];
  defaultMDAId?: string | null;
  isSubmitting?: boolean;
  loadMDACollections: (mdaId: string) => Promise<MDACollectionCode[]>;
  loadMDAServiceCodes: (mdaId: string, collectionCode?: string) => Promise<MDAServiceCode[]>;
  onClose: () => void;
  onSubmit: (payload: InviteMDAPayload) => Promise<{ setupLink: string }>;
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
  const { showToast } = useToast();
  const [values, setValues] = useState<InviteMDAPayload>(() => buildInitialValues(defaultMDAId));
  const [collectionCodes, setCollectionCodes] = useState<MDACollectionCode[]>([]);
  const [serviceCodes, setServiceCodes] = useState<MDAServiceCode[]>([]);
  const [isLoadingScope, setIsLoadingScope] = useState(false);
  const [setupLink, setSetupLink] = useState<string | null>(null);
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);
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
      setSetupLink(null);
      setInvitedEmail(null);
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

    async function fetchCollections() {
      setIsLoadingScope(true);

      try {
        const nextCollections = await loadMDACollections(values.mdaId);

        if (!isMounted) return;
        setCollectionCodes(nextCollections);

        if (
          values.collectionCode &&
          !nextCollections.some((entry) => entry.code === values.collectionCode)
        ) {
          setValues((current) => ({ ...current, collectionCode: '' }));
        }
      } catch (caughtError) {
        if (!isMounted) return;
        setCollectionCodes([]);
        showToast(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load MDA scope options right now.',
          'error',
        );
      } finally {
        if (isMounted) setIsLoadingScope(false);
      }
    }

    void fetchCollections();

    return () => {
      isMounted = false;
    };
  }, [defaultMDAId, loadMDACollections, open, showToast, values.collectionCode, values.mdaId]);

  useEffect(() => {
    if (!open || !values.mdaId) {
      setServiceCodes([]);
      return;
    }

    let isMounted = true;

    async function fetchServices() {
      setIsLoadingScope(true);

      try {
        const nextServices = await loadMDAServiceCodes(values.mdaId, values.collectionCode || undefined);

        if (!isMounted) return;
        setServiceCodes(nextServices);
      } catch (caughtError) {
        if (!isMounted) return;
        setServiceCodes([]);
        showToast(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load service codes right now.',
          'error',
        );
      } finally {
        if (isMounted) setIsLoadingScope(false);
      }
    }

    void fetchServices();

    return () => {
      isMounted = false;
    };
  }, [loadMDAServiceCodes, open, showToast, values.collectionCode, values.mdaId]);

  function updateValue<K extends keyof InviteMDAPayload>(key: K, value: InviteMDAPayload[K]) {
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === 'mdaId' ? { collectionCode: '', serviceCode: '' } : null),
    }));
    setSetupLink(null);
    setInvitedEmail(null);
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit() {
    const emailError = validateEmail(values.email);
    const nextFieldErrors: Partial<Record<keyof InviteMDAPayload, string>> = {
      email: emailError ?? undefined,
      mdaId: values.mdaId ? undefined : 'MDA is required.',
      collectionCode: values.collectionCode ? undefined : 'Collection code is required.',
      serviceCode: undefined,
    };

    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.email || nextFieldErrors.mdaId || nextFieldErrors.collectionCode) {
      return;
    }

    try {
      const payload = {
        email: values.email.trim().toLowerCase(),
        mdaId: values.mdaId,
        collectionCode: values.collectionCode,
        serviceCode: values.serviceCode || undefined,
      };

      const result = await onSubmit(payload);
      setSetupLink(result.setupLink);
      setInvitedEmail(payload.email);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to invite MDA user right now.';
      showToast(message, 'error');
    }
  }

  return (
    <Modal
      open={open}
      title="Invite MDA user"
      description="Send a role-scoped portal invitation tied to an MDA, one collection code, and an optional service code."
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto sm:min-w-[132px]">
            {setupLink ? 'Done' : 'Cancel'}
          </Button>
          <Button
            isLoading={isSubmitting}
            leftIcon={<ShieldPlus className="h-4 w-4" />}
            onClick={() => void handleSubmit()}
            className="w-full sm:w-auto sm:min-w-[132px]"
          >
            {setupLink ? 'Send another invitation' : 'Send invitation'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {setupLink && (
          <div className="app-card p-4">
            <p className="app-kicker">Temporary access link</p>
            <p className="mt-2 text-sm text-slate-600">
              Share this link with <span className="font-semibold text-slate-950">{invitedEmail}</span> so they can create a password and sign in.
            </p>
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm break-all text-slate-700">
              {setupLink}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  void navigator.clipboard
                    .writeText(setupLink)
                    .then(() => {
                      showToast('Setup link copied to clipboard.', 'info');
                    })
                    .catch(() => {
                      showToast('Unable to copy setup link right now.', 'warning');
                    });
                }}
              >
                Copy link
              </Button>
              <a href={setupLink} target="_blank" rel="noreferrer">
                <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="h-4 w-4" />}>
                  Open link
                </Button>
              </a>
            </div>
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          value={values.email}
          error={fieldErrors.email}
          leftAddon={<Mail className="h-4 w-4" />}
          placeholder="user@mda.gov.ng"
          onChange={(event) => updateValue('email', event.target.value)}
        />

        <SearchableDropdown
          label="MDA"
          value={values.mdaId}
          error={fieldErrors.mdaId}
          placeholder="Select MDA"
          searchPlaceholder="Search by MDA code or name"
          options={mdas.map((mda) => ({
            label: `${mda.mdaCode} — ${mda.mdaName}`,
            value: mda.id,
          }))}
          onChange={(nextMdaId) => updateValue('mdaId', nextMdaId)}
        />

        <div className="space-y-4">
          <SearchableDropdown
            label="Collection code"
            value={values.collectionCode}
            error={fieldErrors.collectionCode}
            disabled={!values.mdaId || isLoadingScope}
            hint={values.mdaId && isLoadingScope ? 'Loading MDA collections...' : 'Select an MDA first'}
            placeholder={values.mdaId ? 'Select collection code' : 'Choose an MDA first'}
            searchPlaceholder="Search by collection code or name"
            options={collectionCodes.map((collection) => ({
              label: `${collection.code} — ${collection.name}`,
              value: collection.code,
            }))}
            onChange={(nextCollectionCode) => updateValue('collectionCode', nextCollectionCode)}
          />

          <SearchableDropdown
            label="Service code (optional)"
            value={values.serviceCode}
            error={fieldErrors.serviceCode}
            disabled={!values.mdaId || isLoadingScope}
            hint={
              values.mdaId && isLoadingScope
                ? 'Loading service codes...'
                : 'Type to search system service codes or enter a code manually.'
            }
            placeholder="Search or enter service code"
            searchPlaceholder="Type a service code"
            allowCustomValue
            customValueLabel="Use typed service code"
            options={serviceCodes.map((serviceCode) => ({
              label: `${serviceCode.code} — ${serviceCode.name}`,
              value: serviceCode.code,
              description: values.collectionCode ? `Collection: ${values.collectionCode}` : undefined,
            }))}
            onChange={(nextServiceCode) => updateValue('serviceCode', nextServiceCode)}
          />
        </div>

        {selectedMDA && (
          <div className="app-card p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-gray-300 bg-white p-2 text-slate-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">{selectedMDA.mdaName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Invitations created here are restricted to {selectedMDA.mdaCode}, one collection code, and an optional service code tied to that collection.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
