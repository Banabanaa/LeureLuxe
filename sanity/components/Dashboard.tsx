'use client'

import React from 'react'
import { Card, Flex, Text, Stack, Grid, Spinner, Box, Heading } from '@sanity/ui'
import { useClient } from 'sanity'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import Link from 'next/link'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const ORDER_STATUSES = ['cancelled', 'delivered', 'out_for_delivery', 'paid', 'pending', 'processing', 'shipped']

const COLORS = {
  primary: '#8B5CF6',
  secondary: '#10B981',
  accent: '#F59E0B',
  error: '#EF4444',
  text: '#F3F4F6',
  muted: '#9CA3AF',
  background: '#111827',
  cardBg: '#1F2937',
  border: '#374151',
  chartPrimary: 'rgba(139, 92, 246, 0.7)',
  chartSecondary: 'rgba(16, 185, 129, 0.7)'
}

export default function Dashboard() {
  const client = useClient({ apiVersion: '2023-05-31' })
  const [stats, setStats] = React.useState({
    loading: true,
    totalProducts: 0,
    totalOrders: 0,
    ordersByStatus: {} as Record<string, number>,
    recentOrders: [],
    productCategories: {} as Record<string, number>
  })

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const [
          totalProducts,
          totalOrders,
          ordersByStatus,
          recentOrders,
          categoryCounts
        ] = await Promise.all([
          client.fetch(`count(*[_type == "product"])`),
          client.fetch(`count(*[_type == "order"])`),
          client.fetch(`*[_type == "order"] { status }`).then(res => {
            const counts: Record<string, number> = {}
            ORDER_STATUSES.forEach(status => counts[status] = 0)
            res.forEach((doc: any) => {
              const status = doc.status
              if (status && counts.hasOwnProperty(status)) {
                counts[status]++
              }
            })
            return counts
          }),
          client.fetch(`*[_type == "order"] | order(_createdAt desc)[0...5]{
            _id,
            _createdAt,
            status,
            "customer": customer->name,
            "items": count(items)
          }`),
          client.fetch(`*[_type == "product" && defined(categories)] {
            categories[]-> { title }
          }`).then(res => {
            const counts: Record<string, number> = {}
            res.forEach((product: any) => {
              product.categories?.forEach((cat: any) => {
                const title = cat.title?.toLowerCase()
                if (title) {
                  counts[title] = (counts[title] || 0) + 1
                }
              })
            })
            return counts
          })
        ])

        setStats({
          loading: false,
          totalProducts,
          totalOrders,
          ordersByStatus,
          recentOrders,
          productCategories: categoryCounts
        })
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [client])

  const ordersChartData = {
    labels: ORDER_STATUSES.map(formatStatus),
    datasets: [{
      label: 'Orders by Status',
      data: ORDER_STATUSES.map(s => stats.ordersByStatus[s] || 0),
      backgroundColor: ORDER_STATUSES.map(s => getStatusColor(s, true)),
      borderColor: ORDER_STATUSES.map(s => getStatusColor(s)),
      borderWidth: 1,
      borderRadius: 4
    }]
  }

  const sortedCategories = Object.keys(stats.productCategories).sort()

  const productCategoryChartData = {
    labels: sortedCategories.map(capitalize),
    datasets: [{
      label: 'Products by Category',
      data: sortedCategories.map(cat => stats.productCategories[cat]),
      backgroundColor: sortedCategories.map(getColorForCategory),
      borderColor: sortedCategories.map(getColorForCategory),
      borderWidth: 1,
      borderRadius: 4
    }]
  }

  if (stats.loading) {
    return (
      <Flex align="center" justify="center" padding={4} height="fill" style={{ backgroundColor: COLORS.background }}>
        <Spinner muted />
        <Box style={{ marginLeft: 12 }}>
          <Text style={{ color: COLORS.text }}>Loading dashboard...</Text>
        </Box>
      </Flex>
    )
  }

  return (
    <Box padding={4} style={{ maxWidth: '1400px', margin: '0 auto', backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <Flex align="center" justify="space-between" style={{ marginBottom: 20 }}>
        <Heading as="h1" size={5} style={{ color: COLORS.text, fontWeight: 700, textDecoration: 'underline' }}>
          E-COMMERCE DASHBOARD
        </Heading>
        <Text size={1} style={{ color: COLORS.muted }}>
          Last updated: {new Date().toLocaleDateString()}
        </Text>
      </Flex>

      <Section title="Summary" style={{ marginBottom: 20 }}>
        <Grid columns={[1, 1, 2, 2]} gap={4}>
          <StatCard title="Total Products" value={stats.totalProducts} description="All products in inventory" icon="📦" color={COLORS.primary} />
          <StatCard title="Total Orders" value={stats.totalOrders} description="All orders received" icon="🛒" color={COLORS.secondary} />
        </Grid>
      </Section>

      <Section title="Product Category Analytics" style={{ marginBottom: 20 }}>
        <ChartContainer>
          <Bar data={productCategoryChartData} options={getChartOptions('Products by Category')} />
        </ChartContainer>
      </Section>

      <Section title="Order Analytics" style={{ marginBottom: 20 }}>
        <Grid columns={[2, 3, 4, 7]} gap={3} style={{ marginBottom: 16 }}>
          {ORDER_STATUSES.map(status => (
            <StatCard
              key={status}
              title={formatStatus(status)}
              value={stats.ordersByStatus[status] || 0}
              small
              icon="📝"
              color={getStatusColor(status)}
            />
          ))}
        </Grid>
        <ChartContainer>
          <Bar data={ordersChartData} options={getChartOptions('Orders by Status')} />
        </ChartContainer>
      </Section>

      <Section title="Recent Orders">
        {stats.recentOrders.length > 0 ? (
          <Grid columns={[1, 2, 3]} gap={4}>
            {stats.recentOrders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))}
          </Grid>
        ) : (
          <EmptyState message="No recent orders found" />
        )}
      </Section>
    </Box>
  )
}

// --- UI Components ---

function Section({ title, children, style }: { title: string, children: React.ReactNode, style?: React.CSSProperties }) {
  return (
    <Box style={style}>
      <Heading as="h2" size={3} style={{ color: COLORS.text, fontWeight: 600, marginBottom: 16 }}>
        {title}
      </Heading>
      {children}
    </Box>
  )
}

function StatCard({ title, value, description, small = false, color, icon }: {
  title: string
  value: number
  description?: string
  small?: boolean
  color?: string
  icon?: string
}) {
  const cardColor = color || COLORS.primary
  return (
    <Card padding={small ? 3 : 4} radius={2} shadow={1} style={{ borderLeft: `4px solid ${cardColor}`, backgroundColor: COLORS.cardBg, borderColor: COLORS.border }}>
      <Stack space={small ? 2 : 3}>
        <Flex align="center" gap={2}>
          {icon && <Text size={2} style={{ color: cardColor }}>{icon}</Text>}
          <Text size={small ? 1 : 2} weight="medium" style={{ color: COLORS.muted }}>{title}</Text>
        </Flex>
        <Text size={small ? 3 : 5} weight="bold" style={{ color: COLORS.text }}>{value.toLocaleString()}</Text>
        {description && <Text size={0} style={{ color: COLORS.muted }}>{description}</Text>}
      </Stack>
    </Card>
  )
}

function ChartContainer({ children }: { children: React.ReactNode }) {
  return (
    <Card padding={3} radius={2} shadow={1} style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.border }}>
      <div style={{ height: '350px' }}>{children}</div>
    </Card>
  )
}

function OrderCard({ order }: { order: any }) {
  const orderLink = `/admin/structure/order;${order._id}`
  return (
    <Link href={orderLink} style={{ textDecoration: 'none' }}>
      <Card padding={3} radius={2} shadow={1} style={{
        backgroundColor: COLORS.cardBg,
        borderColor: COLORS.border,
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Stack space={3}>
          <Flex justify="space-between" align="center">
            <Text size={1} weight="medium" style={{ color: COLORS.muted }}>{new Date(order._createdAt).toLocaleDateString()}</Text>
            <Badge status={order.status} />
          </Flex>
          <Text size={1} weight="medium" style={{ color: COLORS.text }}>{order.customer || 'Anonymous Customer'}</Text>
          <Flex justify="space-between" align="center">
            <Text size={1} style={{ color: COLORS.muted }}>{order.items} item{order.items !== 1 ? 's' : ''}</Text>
            <Text size={1} style={{ color: COLORS.primary, fontWeight: 500 }}>View Details →</Text>
          </Flex>
        </Stack>
      </Card>
    </Link>
  )
}

function Badge({ status }: { status: string }) {
  const color = getStatusColor(status)
  const bgColor = getStatusColor(status, true)
  return (
    <Box padding={1} paddingLeft={2} paddingRight={2} style={{
      backgroundColor: bgColor,
      color: color,
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'capitalize'
    }}>
      {formatStatus(status)}
    </Box>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card padding={4} radius={2} shadow={1} style={{ backgroundColor: COLORS.cardBg, textAlign: 'center', borderColor: COLORS.border }}>
      <Text size={2} style={{ color: COLORS.muted }}>{message}</Text>
    </Card>
  )
}

// --- Utility Functions ---

function formatStatus(status: string): string {
  return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getStatusColor(status: string, background = false): string {
  switch (status) {
    case 'pending': return background ? 'rgba(245, 158, 11, 0.2)' : '#F59E0B'
    case 'processing': return background ? 'rgba(59, 130, 246, 0.2)' : '#3B82F6'
    case 'shipped': return background ? 'rgba(139, 92, 246, 0.2)' : '#8B5CF6'
    case 'out_for_delivery': return background ? 'rgba(167, 139, 250, 0.2)' : '#A78BFA'
    case 'delivered': return background ? 'rgba(16, 185, 129, 0.2)' : '#10B981'
    case 'paid': return background ? 'rgba(16, 185, 129, 0.2)' : '#10B981'
    case 'cancelled': return background ? 'rgba(239, 68, 68, 0.2)' : '#EF4444'
    default: return background ? 'rgba(156, 163, 175, 0.2)' : '#9CA3AF'
  }
}

function getColorForCategory(category: string): string {
  const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const hue = hash % 360
  return `hsl(${hue}, 70%, 60%)`
}

function getChartOptions(title: string) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: COLORS.text,
          font: { family: 'Inter, sans-serif' }
        }
      },
      title: {
        display: true,
        text: title,
        color: COLORS.text,
        font: { size: 16 }
      },
      tooltip: {
        backgroundColor: COLORS.cardBg,
        titleColor: COLORS.text,
        bodyColor: COLORS.text,
        borderColor: COLORS.border,
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
      }
    },
    scales: {
      x: {
        grid: { display: false, color: COLORS.border },
        ticks: { color: COLORS.muted }
      },
      y: {
        grid: { color: COLORS.border },
        ticks: { color: COLORS.muted }
      }
    }
  }
}
