import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useEffect, useState } from "react";
import { getMonthlyStats } from "../../Firebase/firebaseBookings.js";
import Loader from "../Loader/Loader.jsx";
import s from "./Stats.module.css";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  Filler,
  ChartDataLabels
);

const Stats = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const monthlyStats = await getMonthlyStats();
      setStats(monthlyStats);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const labels = [
    "01.25",
    "02.25",
    "03.25",
    "04.25",
    "05.25",
    "06.25",
    "07.25",
    "08.25",
    "09.25",
    "10.25",
    "11.25",
    "12.25",
  ];

  const clientsData = labels.map((label) => {
    const month = parseInt(label.substring(0, 2), 10);
    const monthStats = stats[`2025-${month}`];
    return monthStats ? monthStats.clientsCount : 0;
  });

  const amountsData = labels.map((label) => {
    const month = parseInt(label.substring(0, 2), 10);
    const monthStats = stats[`2025-${month}`];
    return monthStats ? monthStats.totalAmount : 0;
  });

  const chartDataClients = {
    labels,
    datasets: [
      {
        label: "Клієнти",
        data: clientsData,
        backgroundColor: "#4A90E2",
        yAxisID: "y1",
        type: "bar",
        barThickness: 5,
        borderRadius: 6,
        datalabels: {
          display: false,
        },
      },
      {
        data: clientsData,
        borderColor: "#F5A623",
        backgroundColor: "rgba(245, 166, 35, 0.3)",
        fill: true,
        tension: 0.1,
        yAxisID: "y1",
        type: "line",
        label: "",
      },
    ],
  };

  const chartDataSum = {
    labels,
    datasets: [
      {
        label: "Сума (грн)",
        data: amountsData,
        backgroundColor: "#F5A623",
        yAxisID: "y2",
        type: "bar",
        barThickness: 5,
        borderRadius: 6,
        datalabels: {
          display: false,
        },
      },
      {
        data: amountsData,
        borderColor: "#4A90E2",
        backgroundColor: "rgba(74, 144, 226, 0.3)",
        fill: true,
        tension: 0.1,
        yAxisID: "y2",
        type: "line",
        label: "",
      },
    ],
  };

  const chartOptionsClients = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.raw} клієнтів`,
        },
      },
      datalabels: {
        color: "#000",
        align: "top",
        anchor: "end",
        font: {
          size: 15,
          weight: "700",
        },
        padding: {
          top: 1,
        },
        formatter: (value) => (value > 0 ? value : ""),
      },
    },
    scales: {
      y1: {
        beginAtZero: true,
        min: 0,
        max: 60,
        ticks: {
          values: [0, 10, 20, 30, 40, 50, 60],
          precision: 0,
        },
        grid: {
          display: true,
        },
      },
      x: {
        type: "category",
        labels: labels,
        ticks: {
          autoSkip: false,
        },
      },
    },
  };

  const chartOptionsSum = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.raw} грн`,
        },
      },
      datalabels: {
        color: "#000",
        align: "top",
        anchor: "end",
        font: {
          size: 15,
          weight: "700",
        },
        padding: {
          top: 1,
        },
        formatter: (value) => (value > 0 ? value : ""),
      },
    },
    scales: {
      y2: {
        beginAtZero: true,
        min: 0,
        max: 60000,
        ticks: {
          values: [
            0, 5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000,
            50000, 55000, 60000,
          ],
          precision: 0,
        },
        grid: {
          display: true,
        },
      },
      x: {
        type: "category",
        labels: labels,
        ticks: {
          autoSkip: false,
        },
      },
    },
  };

  return (
    <div>
      {loading ? (
        <div className={s.loaderContainer}>
          <Loader />
        </div>
      ) : (
        <div className={s.container}>
          <h1 className={s.title}>Статистика по місяцях</h1>
          <div className={s.chartSection}>
            <h2 className={s.chartTitle}>Клієнти</h2>
            <Bar data={chartDataClients} options={chartOptionsClients} />
          </div>

          <div className={s.chartSection}>
            <h2 className={s.chartTitle}>Сума(грн)</h2>
            <Bar data={chartDataSum} options={chartOptionsSum} />
          </div>
          <button className={s.backButton} onClick={() => navigate("/admin")}>
            Назад
          </button>
        </div>
      )}
    </div>
  );
};

export default Stats;
