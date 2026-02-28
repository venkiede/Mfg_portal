import React from 'react';
import { motion } from 'framer-motion';
import { Clock, RefreshCcw, Edit3 } from 'lucide-react';
import { Badge } from './ui/Badge';

const HistoryTimeline = ({ history = [], changelog = [] }) => {
    const allEvents = [
        ...history.map(h => ({ ...h, eventType: 'status_change', date: h.changed_at })),
        ...changelog.map(c => ({ ...c, eventType: 'field_change', date: c.changed_at }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (allEvents.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                <p>No activity recorded for this project yet.</p>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-8"
        >
            {allEvents.map((event, idx) => (
                <motion.div key={idx} variants={itemVariants} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[23px] bg-white dark:bg-gray-900 border-2 border-blue-500 rounded-full w-[14px] h-[14px]"></div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800/80 shadow-sm ml-2">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                {new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
                                {event.changed_by}
                            </span>
                        </div>

                        {event.eventType === 'status_change' ? (
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <RefreshCcw size={16} className="text-blue-500" />
                                <span>Status transitioned to</span>
                                <Badge>{event.status}</Badge>
                            </div>
                        ) : (
                            <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <Edit3 size={16} className="text-gray-400 mt-0.5" />
                                <div>
                                    Updated <span className="font-semibold text-gray-900 dark:text-gray-100">{event.field_name}</span> from{' '}
                                    <span className="line-through text-gray-400">{event.old_value}</span>{' '}
                                    <span className="text-gray-400">&rarr;</span>{' '}
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{event.new_value}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default HistoryTimeline;
