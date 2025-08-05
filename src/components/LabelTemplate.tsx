import { format } from "date-fns";

interface LabelTemplateProps {
  batchId: string;
  productName: string;
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  labelNumber?: number;
  totalLabels?: number;
}

export const LabelTemplate = ({ 
  batchId, 
  productName, 
  batchNumber, 
  productionDate, 
  expiryDate,
  labelNumber = 1,
  totalLabels = 1
}: LabelTemplateProps) => {
  const qrCodeData = `BATCH:${batchNumber}|PROD:${productionDate}|EXP:${expiryDate}`;
  
  return (
    <div 
      id={`label-${batchId}-${labelNumber}`}
      className="label-template"
      style={{
        width: '4in',
        height: '3in',
        padding: '8px',
        border: '1px solid #000',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        backgroundColor: 'white',
        color: 'black',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '4px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>TOTHAI</div>
        <div style={{ fontSize: '10px' }}>Production Kitchen</div>
      </div>

      {/* Product Info */}
      <div style={{ flex: 1, padding: '8px 0' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
          {productName}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span><strong>Batch:</strong> {batchNumber}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span><strong>Prod:</strong> {format(new Date(productionDate), 'dd/MM/yyyy')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span><strong>Exp:</strong> {format(new Date(expiryDate), 'dd/MM/yyyy')}</span>
        </div>
      </div>

      {/* QR Code placeholder */}
      <div style={{ 
        textAlign: 'center', 
        border: '1px dashed #666', 
        padding: '8px',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ fontSize: '8px', marginBottom: '2px' }}>QR Code</div>
        <div style={{ fontSize: '6px', wordBreak: 'break-all' }}>{qrCodeData}</div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '8px', marginTop: '4px' }}>
        Label {labelNumber} of {totalLabels}
      </div>
    </div>
  );
};