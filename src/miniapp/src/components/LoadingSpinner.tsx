import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: string;
  fullscreen?: boolean;
}

function LoadingSpinner({ 
  size = 'md', 
  variant = 'primary',
  fullscreen = false 
}: LoadingSpinnerProps) {
  const spinnerSize = {
    sm: '1rem',
    md: '2rem',
    lg: '3rem'
  }[size];

  if (fullscreen) {
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75">
        <Spinner
          animation="border"
          variant={variant}
          style={{ width: spinnerSize, height: spinnerSize }}
        />
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center p-3">
      <Spinner
        animation="border"
        variant={variant}
        style={{ width: spinnerSize, height: spinnerSize }}
      />
    </div>
  );
}

export default LoadingSpinner; 