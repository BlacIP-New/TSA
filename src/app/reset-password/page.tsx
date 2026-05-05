import ResetPasswordPage from '../../views/ResetPasswordPage';

type ResetPasswordRouteProps = {
  searchParams?: Promise<{
    token?: string | string[];
  }>;
};

export default async function ResetPasswordRoute({ searchParams }: ResetPasswordRouteProps) {
  const resolvedSearchParams = await searchParams;
  const token = Array.isArray(resolvedSearchParams?.token)
    ? resolvedSearchParams.token[0]
    : resolvedSearchParams?.token;

  return <ResetPasswordPage token={token} />;
}