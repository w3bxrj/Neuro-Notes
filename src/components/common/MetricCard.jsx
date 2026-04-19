import React from 'react';

export default function MetricCard(props) {
  const { title, value, colorClass, borderHoverClass, iconClass } = props;
  const IconComponent = props.icon;

  return (
    <div className={`p-6 rounded-2xl glass flex items-center justify-between group ${borderHoverClass} transition-colors`}>
      <div>
        <p className="text-sm text-textSecondary uppercase tracking-wide mb-1">{title}</p>
        <p className="text-4xl font-bold text-textPrimary">{value}</p>
      </div>
      <div className={`${colorClass} p-4 rounded-xl group-hover:scale-110 transition-transform`}>
        <IconComponent className={`w-8 h-8 ${iconClass}`} />
      </div>
    </div>
  );
}
