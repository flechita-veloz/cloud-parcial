type ErrorStatus = {
  isLoading: boolean;
  isError: boolean;
  name: string;
};

type Props = {
  errors: ErrorStatus[];
  children: React.ReactNode;
};

const QueryStateHandler = ({ errors, children }: Props) => {
  for (const e of errors) {
    if (e.isLoading) {
      return <div className="py-4">Cargando {e.name}...</div>;
    }

    if (e.isError) {
      return <div className="text-center text-red-500 py-4">Error al obtener {e.name}</div>;
    }
  }

  return <>{children}</>;
};

export default QueryStateHandler;