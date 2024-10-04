"use client";

export function LineNumbers({ code }: { code: string }) {
  const lines = code.split("\n").length;
  const numbers = Array.from({ length: lines }, (_, i) => i + 1);
  return (
    <div className="line-numbers">
      {numbers.map((number) => (
        <div key={number} className="line-number">
          {number}
        </div>
      ))}
    </div>
  );
}
