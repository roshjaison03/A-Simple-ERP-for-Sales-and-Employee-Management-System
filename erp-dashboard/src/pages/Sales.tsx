// src/pages/Sales.jsx
import SalesTable from '../components/SalesTable'

export default function Sales({ sidebarHovered, setSidebarHovered }: { sidebarHovered: boolean, setSidebarHovered: (v: boolean) => void }) {
  return (
    <SalesTable sidebarHovered={sidebarHovered} setSidebarHovered={setSidebarHovered} />
  );
}
