
interface PackingSlipHeaderProps {
  packingSlipNumber: string;
  currentDate: string;
}

export function PackingSlipHeader({ packingSlipNumber, currentDate }: PackingSlipHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-4">
      <div className="flex flex-col items-start">
        <div className="text-xs leading-tight">
          <p className="text-gray-800 font-semibold">ToThai BV</p>
          <p className="text-gray-600">Production Kitchen</p>
          <p className="text-gray-600">Leuvensestraat 100</p>
          <p className="text-gray-600">3300 Tienen</p>
          <p className="text-gray-600 font-medium">Registration 0534 968 163</p>
        </div>
      </div>
      <div className="text-right">
        <h2 className="text-lg font-bold mb-1">PACKING SLIP</h2>
        <p className="font-mono text-sm">#{packingSlipNumber}</p>
        <p className="text-sm">{currentDate}</p>
      </div>
    </div>
  );
}
