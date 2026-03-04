import ResetPasswordClient from "./ResetPasswordClient";

type Props = {
  searchParams?: {
    token?: string;
  };
};

export default function ResetPasswordPage({ searchParams }: Props) {
  const token = searchParams?.token ?? "";
  return <ResetPasswordClient token={token} />;
}