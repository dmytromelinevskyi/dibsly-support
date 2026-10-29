import '../../styles/device.css';
/** Native captures include their own status bar and Dynamic Island. */
export default function IPhoneFrame({ children, className = '' }) {
  return (
    <div className={`iphone-frame ${className}`}>
      <i className="iphone-button left first" />
      <i className="iphone-button left second" />
      <i className="iphone-button right" />
      <div className="iphone-glass">{children}</div>
    </div>
  );
}
