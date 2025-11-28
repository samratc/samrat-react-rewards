import React, { useMemo } from "react";
import PeriodSummaryTable from "../modules/rewards/components/PeriodSummaryTable.jsx";

const DashboardPage = () => {
  const dateInfo = useMemo(() => {
    const todayDate = new Date();
    const threeMonthsAgoDate = new Date(todayDate);
    threeMonthsAgoDate.setMonth(todayDate.getMonth() - 3);

    const today = todayDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const threeMonthsAgo = threeMonthsAgoDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return { today, threeMonthsAgo };
  }, []);

  return (
    <>
    <PeriodSummaryTable />
    </>
  )
};

export default DashboardPage;
