import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Card, CardContent } from './ui/Card';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-lg">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1">{label}</p>
                <p className="text-xs text-blue-500 font-bold">
                    {payload[0].value}{payload[0].unit || ''}
                </p>
            </div>
        );
    }
    return null;
};

const DashboardChart = ({ title, subtitle, data, dataKey = "value", categoryKey = "name", colors = [], unit = "" }) => {
    const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];
    const chartColors = colors.length > 0 ? colors : defaultColors;

    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Card className="h-full">
            <CardContent className="h-full flex flex-col p-4 sm:p-5">
                <div className="mb-4 sm:mb-6">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
                    {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                </div>

                <div className="w-full min-w-0">
                    <ResponsiveContainer width="100%" aspect={isMobile ? 1.5 : 2.2} debounce={100}>
                        <BarChart
                            data={data}
                            margin={{ 
                                top: 5, 
                                right: 5, 
                                left: isMobile ? -30 : -20, 
                                bottom: 0 
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey={categoryKey}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: isMobile ? 8 : 10 }}
                                dy={10}
                                interval={0}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: isMobile ? 8 : 10 }}
                            />
                            <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                            <Bar
                                dataKey={dataKey}
                                radius={[4, 4, 0, 0]}
                                barSize={isMobile ? 16 : 32}
                                unit={unit}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default DashboardChart;
