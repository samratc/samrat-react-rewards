import { useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { withModal } from "../../../shared/hoc/withModal.jsx";
import { withLoadingState } from "../../../shared/hoc/withLoadingState.jsx";
import { useRewardsData } from "../../../shared/hooks/useRewardsData.js";
import { usePurchaseHistory } from "../../../shared/hooks/usePurchaseHistory.js";
import PeriodBreakdownCell from "./PeriodBreakdownCell.jsx";

/**
 * Table component for displaying rewards summary
 */
function RewardsTableBase({ isModalOpen, modalData, openModal, closeModal }) {
  const { rewardsData, isLoading, error } = useRewardsData();
  const { purchaseHistory, isLoading: historyLoading, error: historyError, fetchHistory } = usePurchaseHistory();

  const handleRowClick = useCallback(async (customer) => {
    openModal({ id: customer.customerId, name: customer.name });
    
    try {
      const customerData = await fetchHistory(customer.customerId);
      openModal({
        id: customerData.customerId,
        name: customerData.customerName,
      });
    } catch (err) {
      console.error("Failed to fetch purchase history:", err);
    }
  }, [openModal, fetchHistory]);

  const tableColumns = useMemo(
    () => [
      {
        header: "User ID",
        accessorKey: "customerId",
        cell: ({ getValue }) => <span className="font-mono text-gray-700">{getValue()}</span>,
        enableSorting: false,
      },
      {
        header: "Username",
        accessorKey: "name",
        cell: ({ getValue }) => <span className="font-medium text-gray-900">{getValue()}</span>,
        enableSorting: false,
      },
      {
        header: "Total Points",
        accessorKey: "totalPoints",
        cell: ({ getValue }) => (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary-100 text-primary-700">
            {getValue()}
          </span>
        ),
        enableSorting: true,
      },
      {
        header: "Total Amount",
        accessorKey: "totalAmountSpent",
        cell: ({ getValue }) => {
          const amount = getValue();
          return <span className="font-semibold text-gray-900">${Number(amount ?? 0).toFixed(2)}</span>;
        },
        enableSorting: true,
      },
      {
        header: "Monthly Breakdown",
        accessorKey: "monthlyPoints",
        cell: ({ getValue }) => <PeriodBreakdownCell breakdown={getValue()} />,
        enableSorting: false,
      },
    ],
    []
  );

  const tableInstance = useReactTable({
    data: rewardsData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    enableSortingRemoval: false,
    sortDescFirst: false,
  });

  const renderTableHeader = useCallback(() => (
    <thead className="bg-gradient-to-r from-primary-600 to-primary-700 border-b-2 border-primary-800">
      {tableInstance.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort();
            const sortingState = header.column.getIsSorted();

            return (
              <th
                key={header.id}
                onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                className={`px-6 py-2.5 text-left text-xs font-bold text-black uppercase tracking-wider ${
                  canSort ? "cursor-pointer select-none hover:bg-primary-800 transition-colors duration-200" : ""
                }`}
                title={canSort ? "Click to sort" : undefined}
                aria-sort={
                  canSort
                    ? sortingState === "asc"
                      ? "ascending"
                      : sortingState === "desc"
                      ? "descending"
                      : "none"
                    : undefined
                }
              >
                <span className="inline-flex items-center gap-2">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {canSort && (
                    <span className="inline-flex flex-col leading-none" aria-hidden="true">
                      <span
                        className={`text-xs transition-all duration-200 ${
                          sortingState === "asc" ? "opacity-100 text-black scale-110" : "opacity-50 text-black"
                        }`}
                      >
                        ▲
                      </span>
                      <span
                        className={`text-xs transition-all duration-200 ${
                          sortingState === "desc" ? "opacity-100 text-black scale-110" : "opacity-50 text-black"
                        }`}
                      >
                        ▼
                      </span>
                    </span>
                  )}
                </span>
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  ), [tableInstance]);

  const renderTableBody = useCallback(() => (
    <tbody className="bg-white divide-y divide-gray-200">
      {tableInstance.getRowModel().rows.map((row, index) => (
        <tr
          key={row.id}
          onClick={() => handleRowClick(row.original)}
          className={`transition-all duration-200 ${
            index % 2 === 0 ? "bg-white" : "bg-gray-50"
          } hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 cursor-pointer hover:shadow-md border-l-4 border-transparent hover:border-primary-500`}
        >
          {row.getVisibleCells().map((cell) => (
            <td
              key={cell.id}
              className="px-6 py-3 whitespace-nowrap text-sm text-gray-900"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  ), [tableInstance, handleRowClick]);

  const renderPagination = useCallback(() => (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-6 px-4 py-4 bg-gray-50 rounded-lg border border-gray-200">
      <button
        onClick={() => tableInstance.setPageIndex(0)}
        disabled={!tableInstance.getCanPreviousPage()}
        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-primary-50 hover:border-primary-400 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 shadow-sm hover:shadow-md"
      >
        {"<<"}
      </button>
      <button
        onClick={() => tableInstance.previousPage()}
        disabled={!tableInstance.getCanPreviousPage()}
        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-primary-50 hover:border-primary-400 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 shadow-sm hover:shadow-md"
      >
        {"<"}
      </button>
      <span className="mx-4 font-semibold text-gray-800 px-4 py-2 bg-white rounded-lg border border-gray-300 shadow-sm">
        Page{" "}
        <strong className="text-primary-600">
          {tableInstance.getState().pagination.pageIndex + 1} of{" "}
          {tableInstance.getPageCount()}
        </strong>
      </span>
      <button
        onClick={() => tableInstance.nextPage()}
        disabled={!tableInstance.getCanNextPage()}
        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-primary-50 hover:border-primary-400 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 shadow-sm hover:shadow-md"
      >
        {">"}
      </button>
      <button
        onClick={() => tableInstance.setPageIndex(tableInstance.getPageCount() - 1)}
        disabled={!tableInstance.getCanNextPage()}
        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-primary-50 hover:border-primary-400 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 shadow-sm hover:shadow-md"
      >
        {">>"}
      </button>
      <select
        value={tableInstance.getState().pagination.pageSize}
        onChange={(event) => {
          tableInstance.setPageSize(Number(event.target.value));
        }}
        className="ml-2 px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 cursor-pointer transition-all duration-200 hover:border-primary-400 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
      >
        {[5, 10, 20, 30, 40, 50].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </select>
    </div>
  ), [tableInstance]);

  const renderModal = useCallback(() => {
    if (!isModalOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn"
        onClick={closeModal}
        role="presentation"
      >
        <div
          className="bg-white w-full max-w-3xl max-h-[85vh] rounded-xl overflow-hidden shadow-2xl flex flex-col transform transition-all duration-300 scale-100 border border-gray-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-between border-b border-primary-800 shadow-sm">
            <h3 id="modal-title" className="text-xl font-bold text-black flex items-center gap-2">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-black">{modalData?.name ? `${modalData.name}'s Transactions` : "Transactions"}</span>
            </h3>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-black text-xl leading-none cursor-pointer transition-all duration-200 hover:scale-110 shadow-sm"
              onClick={closeModal}
              aria-label="Close modal"
            >
              ×
            </button>
          </header>

          <div className="p-6 overflow-auto bg-gray-50">
            {historyLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-4"></div>
                <div className="text-gray-600 text-lg font-medium">Loading transactions…</div>
              </div>
            )}
            {historyError && (
              <div className="text-center py-12 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="text-red-600 text-lg font-semibold">Error: {historyError}</div>
              </div>
            )}

            {!historyLoading && !historyError && purchaseHistory.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg font-medium">No transactions found.</div>
              </div>
            )}

            {!historyLoading && !historyError && purchaseHistory.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="w-full border-collapse">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseHistory.map((transaction, index) => (
                      <tr 
                        key={transaction.transactionId} 
                        className={`border-b border-gray-100 transition-colors duration-150 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-primary-50`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-700 font-mono">{transaction.transactionId}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(transaction.date).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">${Number(transaction.amount).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary-100 text-primary-700 border border-primary-200">
                            {transaction.points}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [isModalOpen, modalData, historyLoading, historyError, purchaseHistory, closeModal]);

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-xl text-red-800 text-center shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200">
        <div className="bg-primary-700 px-6 py-4 border-primary-800 shadow-md">
          <h2 className="text-2xl font-bold text-black flex items-center gap-2">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-black">Rewards Summary</span>
          </h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          {renderTableHeader()}
          {isLoading ? (
            <tbody>
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    <div className="text-gray-500 text-lg font-medium">Loading customers...</div>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            renderTableBody()
          )}
        </table>
      </div>

      {!isLoading && renderPagination()}
      {renderModal()}
    </div>
  );
}

const RewardsTableWithModal = withModal(RewardsTableBase);
const PeriodSummaryTable = withLoadingState(RewardsTableWithModal);
export default PeriodSummaryTable;
