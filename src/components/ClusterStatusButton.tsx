import {
  useCluster,
  ClusterStatus,
  useClusterModal,
} from "providers/cluster";

export function ClusterStatusBanner() {
  const [, setShow] = useClusterModal();

  return (
    <div className="container d-md-none my-4">
      <div onClick={() => setShow(false)}>
        <Button />
      </div>
    </div>
  );
}

export function ClusterStatusButton() {
  const [, setShow] = useClusterModal();

  return (
    <div onClick={() => setShow(false)}>
      <Button />
    </div>
  );
}

function Button() {
  const { status } = useCluster();

  const btnClasses = (variant: string) => {
    return `btn d-block btn-${variant}`;
  };

  const spinnerClasses = "spinner-grow spinner-grow-sm mr-2";

  switch (status) {
    case ClusterStatus.Connected:
      return (
        <span className={btnClasses("primary")}>
          <span className="fe fe-check-circle mr-2"></span>
          {/* {statusName} */}
          Testnet Beta
        </span>
      );

    case ClusterStatus.Connecting:
      return (
        <span className={btnClasses("primary")}>
          <span
            className={spinnerClasses}
            role="status"
            aria-hidden="true"
          ></span>
          Testnet
          {/* {statusName} */}
        </span>
      );

    case ClusterStatus.Failure:
      return (
        <span className={btnClasses("danger")}>
          <span className="fe fe-alert-circle mr-2"></span>
          {/* {statusName} */}
        </span>
      );
  }
}
