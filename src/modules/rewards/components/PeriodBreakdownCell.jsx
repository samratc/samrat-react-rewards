import React, { useMemo } from "react";

/**
 * Component for displaying period breakdown data in a nested table
 * @param {Object} props
 * @param {Object} props.breakdown - Period points and spending data keyed by YYYY-MM
 */
export default function PeriodBreakdownCell({ breakdown }) {
  const entries = useMemo(() => Object.entries(breakdown || {}), [breakdown]);

  if (entries.length === 0) {
    return (
      <em className="text-gray-400 italic text-sm">No data</em>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
            <th className="text-left font-bold text-xs py-1.5 px-2 text-gray-700 border-b border-gray-200">Month</th>
            <th className="text-left font-bold text-xs py-1.5 px-2 text-gray-700 border-b border-gray-200">Points</th>
            <th className="text-left font-bold text-xs py-1.5 px-2 text-gray-700 border-b border-gray-200">Amount</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([month, info], index) => (
            <tr 
              key={month} 
              className={`border-b border-gray-100 transition-colors ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-primary-50`}
            >
              <td className="py-1.5 px-2 whitespace-nowrap text-gray-700 font-medium">{month}</td>
              <td className="py-1.5 px-2 whitespace-nowrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-primary-100 text-primary-700">
                  {info.points}
                </span>
              </td>
              <td className="py-1.5 px-2 whitespace-nowrap text-gray-700 font-semibold">${info.amountSpent.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
