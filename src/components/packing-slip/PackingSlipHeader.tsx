
interface PackingSlipHeaderProps {
  packingSlipNumber: string;
  currentDate: string;
}

export function PackingSlipHeader({ packingSlipNumber, currentDate }: PackingSlipHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-8">
      <div className="flex flex-col items-start">
        <img 
          src="/lovable-uploads/049be7aa-e57b-4eb6-bec2-515a4c2b96b3.png" 
          alt="TOTHAI Logo" 
          className="h-16 w-auto object-contain mb-4"
        />
        <div>
          <p className="text-gray-600">Production Kitchen</p>
          <p className="text-gray-600">Leuvensestraat 100</p>
          <p className="text-gray-600">3300 Tienen</p>
          <p className="text-gray-600 font-semibold">BE0534 968 163</p>
        </div>
      </div>
      <div className="text-right">
        <h2 className="text-xl font-bold mb-1">PACKING SLIP</h2>
        <p className="font-mono text-sm">#{packingSlipNumber}</p>
        <p className="text-sm">{currentDate}</p>
      </div>
    </div>
  );
}
