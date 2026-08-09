'use client'

import { ProtectedLayout } from '@/components/protected-layout'
import { useAnalysisHistory } from '@/hooks/use-skin-analysis'
import { motion } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Calendar, AlertCircle, Target } from 'lucide-react'

export default function AnalyticsPage() {
  const { history } = useAnalysisHistory()

  // Calculate analytics data
  const totalAnalyses = history.length
  const avgConfidence = history.length > 0 
    ? (history.reduce((sum, a) => sum + a.confidence, 0) / history.length * 100).toFixed(1)
    : 0

  // Most common condition
  const conditionCounts: Record<string, number> = {}
  history.forEach(a => {
    a.conditions.forEach(c => {
      conditionCounts[c] = (conditionCounts[c] || 0) + 1
    })
  })
  const mostCommonCondition = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0]

  // Monthly data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const count = history.filter(a => {
      const aDate = new Date(a.timestamp)
      return aDate.getMonth() === date.getMonth() && aDate.getFullYear() === date.getFullYear()
    }).length
    return { month: monthStr, count }
  }).reverse()

  // Skin type distribution
  const skinTypeData = Object.entries(
    history.reduce((acc: Record<string, number>, a) => {
      acc[a.skin_type] = (acc[a.skin_type] || 0) + 1
      return acc
    }, {})
  ).map(([type, count]) => ({ name: type, value: count }))

  const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <ProtectedLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Insights into your skin health journey and progress over time.
          </p>
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="glass-card p-6 rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Analyses</p>
                <h3 className="text-3xl font-bold text-foreground">{totalAnalyses}</h3>
              </div>
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Since you joined
            </p>
          </motion.div>

          <motion.div variants={item} className="glass-card p-6 rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Average Confidence</p>
                <h3 className="text-3xl font-bold text-foreground">{avgConfidence}%</h3>
              </div>
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Analysis accuracy
            </p>
          </motion.div>

          <motion.div variants={item} className="glass-card p-6 rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Most Common</p>
                <h3 className="text-xl font-bold text-foreground truncate">
                  {mostCommonCondition?.[0] || 'N/A'}
                </h3>
              </div>
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Detected {mostCommonCondition?.[1] || 0} times
            </p>
          </motion.div>

          <motion.div variants={item} className="glass-card p-6 rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Consistency</p>
                <h3 className="text-3xl font-bold text-foreground">
                  {totalAnalyses > 0 ? '✓' : '—'}
                </h3>
              </div>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Regular tracking active
            </p>
          </motion.div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trend */}
          <motion.div
            className="lg:col-span-2 glass-card p-6 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-foreground mb-6">Analysis Frequency</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Skin Type Distribution */}
          {skinTypeData.length > 0 && (
            <motion.div
              className="glass-card p-6 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-foreground mb-6">Skin Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={skinTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {skinTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* Condition Breakdown */}
        {Object.entries(conditionCounts).length > 0 && (
          <motion.div
            className="glass-card p-6 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-bold text-foreground mb-6">Condition Frequency</h3>
            <div className="space-y-4">
              {Object.entries(conditionCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([condition, count]) => (
                  <div key={condition} className="flex items-center gap-4">
                    <span className="w-40 text-sm font-medium text-foreground capitalize truncate">
                      {condition}
                    </span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / Object.values(conditionCounts).reduce((a, b) => a + b)) * 100}%` }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-12 text-right">
                      {count}x
                    </span>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {totalAnalyses === 0 && (
          <motion.div
            className="glass-card p-12 rounded-xl text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto opacity-50 mb-4" />
            <p className="text-muted-foreground mb-4">
              No data yet. Start analyzing your skin to see insights.
            </p>
          </motion.div>
        )}
      </div>
    </ProtectedLayout>
  )
}
