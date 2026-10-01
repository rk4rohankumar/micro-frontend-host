import React from 'react';
import { Button, Result, Skeleton } from 'antd';

export function RemoteLoading({ remote }) {
  return (
    <div role="status" className="py-6">
      <p className="mb-4 text-sm text-gray-600">
        Loading {remote.label} from {new URL(remote.url).host}…
      </p>
      <Skeleton active paragraph={{ rows: 6 }} />
    </div>
  );
}

export function RemoteFailed({ remote, error, onRetry }) {
  return (
    <Result
      status="error"
      title={`${remote.label} failed to load`}
      subTitle={
        <>
          The remote at <code>{new URL(remote.url).host}</code> did not respond.
          {error?.message ? ` ${error.message}` : ''} The rest of the shell keeps working.
        </>
      }
      extra={[
        <Button key="retry" type="primary" onClick={onRetry}>
          Retry
        </Button>,
        <Button key="open" href={remote.url} target="_blank" rel="noopener noreferrer">
          Open standalone
        </Button>,
      ]}
    />
  );
}

export function NotFound() {
  return (
    <Result
      status="404"
      title="No such remote"
      subTitle="Pick one of the apps above."
      extra={
        <Button type="primary" href="/">
          Back to the first app
        </Button>
      }
    />
  );
}
