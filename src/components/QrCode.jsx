import { generateQrModules } from '../lib/qrPattern';

const GRID_SIZE = 21;
const MODULE_PX = 8;
const QUIET_ZONE = MODULE_PX * 2;
const CANVAS_PX = GRID_SIZE * MODULE_PX + QUIET_ZONE * 2;

export default function QrCode({ value }) {
  const modules = generateQrModules(value, GRID_SIZE);

  return (
    <div
      className="mt-4 inline-block rounded-xl border border-ink/10 bg-white p-3 shadow-sm"
      role="img"
      aria-label="Simulated QR payment code"
    >
      <svg
        width={CANVAS_PX}
        height={CANVAS_PX}
        viewBox={`0 0 ${CANVAS_PX} ${CANVAS_PX}`}
        aria-hidden="true"
      >
        <rect width={CANVAS_PX} height={CANVAS_PX} fill="#ffffff" />
        {modules.map((row, rowIndex) =>
          row.map(
            (isDark, colIndex) =>
              isDark && (
                <rect
                  key={`${rowIndex}-${colIndex}`}
                  x={QUIET_ZONE + colIndex * MODULE_PX}
                  y={QUIET_ZONE + rowIndex * MODULE_PX}
                  width={MODULE_PX}
                  height={MODULE_PX}
                  fill="#2B1B12"
                />
              )
          )
        )}
      </svg>
    </div>
  );
}
