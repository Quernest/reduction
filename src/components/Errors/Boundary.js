// @flow
import React from 'react';

type Props = {
  children: React.Node,
};

class ErrorBoundary extends React.Component<Props> {
  state = {
    error: null,
    errorInfo: null,
  };

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    const { children } = this.props;
    const { error, errorInfo } = this.state;

    if (errorInfo) {
      return (
        <div>
          <h5>Something went wrong</h5>
          <p>{error && error.toString()}</p>
          <br />
          {errorInfo.componentStack}
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
