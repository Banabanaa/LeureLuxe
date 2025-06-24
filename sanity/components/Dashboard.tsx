'use client'

import React from 'react'
import {Card, Flex, Text, Stack, Grid, Spinner, Box, Heading} from '@sanity/ui'
import {useClient} from 'sanity'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import {Bar} from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const ORDER_STATUSES = [
  'cancelled',
  'delivered',
  'out_for_delivery',
  'paid',
  'pending',
  'processing',
  'shipped'
]

// Dark mode color palette
const COLORS = {
  primary: '#8B5CF6',  // Purple-400
  secondary: '#10B981', // Emerald-500
  accent: '#F59E0B',    // Amber-500
  error: '#EF4444',     // Red-500
  text: '#F3F4F6',      // Gray-100
  muted: '#9CA3AF',     // Gray-400
  background: '#111827', // Gray-900
  cardBg: '#1F2937',    // Gray-800
  border: '#374151',     // Gray-700
  chartPrimary: 'rgba(139, 92, 246, 0.7)',
  chartSecondary: 'rgba(16, 185, 129, 0.7)'
}

export default function Dashboard() {
  const client = useClient({apiVersion: '2023-05-31'})
  const [stats, setStats] = React.useState<{
    loading: boolean
    totalProducts: number
    productsByCategory: Record<string, number>
    totalOrders: number
    ordersByStatus: Record<string, number>
    recentOrders: any[]
    categories: string[]
  }>({
    loading: true,
    totalProducts: 0,
    productsByCategory: {},
    totalOrders: 0,
    ordersByStatus: {},
    recentOrders: [],
    categories: []
  })

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const [
          totalProducts,
          productsByCategory,
          totalOrders,
          ordersByStatus,
          recentOrders,
          categories
        ] = await Promise.all([
          client.fetch(`count(*[_type == "product"])`),
          client.fetch(`*[_type == "product"] {
            "category": category->title
          }`).then(res => {
            const counts: Record<string, number> = {}
            res.forEach((doc: any) => {
              const cat = doc.category?.toLowerCase()
              if (cat) {
                counts[cat] = (counts[cat] || 0) + 1
              }
            })
            return counts
          }),
          client.fetch(`count(*[_type == "order"])`),
          client.fetch(`*[_type == "order"] {
            status
          }`).then(res => {
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
          client.fetch(`*[_type == "category"].title`)
        ])

        setStats({
          loading: false,
          totalProducts,
          productsByCategory,
          totalOrders,
          ordersByStatus,
          recentOrders,
          categories: categories.map((c: string) => c.toLowerCase())
        })
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        setStats(prev => ({...prev, loading: false}))
      }
    }

    fetchStats()
  }, [client])

  const productsChartData = {
    labels: stats.categories.map(formatCategory),
    datasets: [{
      label: 'Products by Category',
      data: stats.categories.map(c => stats.productsByCategory[c.toLowerCase()] || 0),
      backgroundColor: COLORS.chartPrimary,
      borderColor: COLORS.primary,
      borderWidth: 1,
      borderRadius: 4
    }]
  }

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

  if (stats.loading) {
    return (
      <Flex align="center" justify="center" padding={4} height="fill" style={{backgroundColor: COLORS.background}}>
        <Spinner muted />
        <Box marginLeft={3}>
          <Text style={{color: COLORS.text}}>Loading dashboard...</Text>
        </Box>
      </Flex>
    )
  }

  return (
    <Box padding={4} style={{maxWidth: '1400px', margin: '0 auto', backgroundColor: COLORS.background, minHeight: '100vh'}}>
      {/* Header */}
      <Flex align="center" justify="space-between" marginBottom={5}>
        <Heading as="h1" size={4} style={{color: COLORS.text, fontWeight: 600}}>
          E-commerce Dashboard
        </Heading>
        <Text size={1} style={{color: COLORS.muted}}>
          Last updated: {new Date().toLocaleDateString()}
        </Text>
      </Flex>

      {/* Summary Cards */}
      <Section title="Summary" marginBottom={5}>
        <Grid columns={[1, 1, 2, 2]} gap={4}>
          <StatCard 
            title="Total Products" 
            value={stats.totalProducts} 
            description="All products in inventory"
            icon="📦"
            color={COLORS.primary}
          />
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders} 
            description="All orders received"
            icon="🛒"
            color={COLORS.secondary}
          />
        </Grid>
      </Section>

      {/* Products Section */}
      <Section title="Product Analytics" marginBottom={5}>
        {stats.categories.length > 0 ? (
          <>
            <Grid columns={[2, 3, 4, 7]} gap={3} marginBottom={4}>
              {stats.categories.map(category => (
                <StatCard
                  key={category}
                  title={formatCategory(category)}
                  value={stats.productsByCategory[category.toLowerCase()] || 0}
                  small
                  icon="📊"
                />
              ))}
            </Grid>
            <ChartContainer>
              <Bar 
                data={productsChartData} 
                options={getChartOptions('Products by Category')}
              />
            </ChartContainer>
          </>
        ) : (
          <EmptyState message="No product categories found" />
        )}
      </Section>

      {/* Orders Section */}
      <Section title="Order Analytics" marginBottom={5}>
        <Grid columns={[2, 3, 4, 7]} gap={3} marginBottom={4}>
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
          <Bar 
            data={ordersChartData} 
            options={getChartOptions('Orders by Status')}
          />
        </ChartContainer>
      </Section>

      {/* Recent Orders */}
      <Section title="Recent Orders">
        {stats.recentOrders.length > 0 ? (
          <Grid columns={[1, 2, 3]} gap={4}>
            {stats.recentOrders.map(order => (
              <OrderCard 
                key={order._id}
                order={order}
              />
            ))}
          </Grid>
        ) : (
          <EmptyState message="No recent orders found" />
        )}
      </Section>
    </Box>
  )
}

function Section({title, children, marginBottom = 0}: {
  title: string
  children: React.ReactNode
  marginBottom?: number
}) {
  return (
    <Box marginBottom={marginBottom}>
      <Heading as="h2" size={3} marginBottom={4} style={{color: COLORS.text, fontWeight: 600}}>
        {title}
      </Heading>
      {children}
    </Box>
  )
}

function StatCard({title, value, description, small = false, color, icon}: {
  title: string
  value: number
  description?: string
  small?: boolean
  color?: string
  icon?: string
}) {
  const cardColor = color || COLORS.primary
  return (
    <Card 
      padding={small ? 3 : 4} 
      radius={2} 
      shadow={1} 
      style={{
        borderLeft: `4px solid ${cardColor}`,
        backgroundColor: COLORS.cardBg,
        borderColor: COLORS.border
      }}
    >
      <Stack space={small ? 2 : 3}>
        <Flex align="center" gap={2}>
          {icon && <Text size={2} style={{color: cardColor}}>{icon}</Text>}
          <Text 
            size={small ? 1 : 2} 
            weight="medium"
            style={{color: COLORS.muted}}
          >
            {title}
          </Text>
        </Flex>
        <Text 
          size={small ? 3 : 5} 
          weight="bold" 
          style={{color: COLORS.text}}
        >
          {value.toLocaleString()}
        </Text>
        {description && (
          <Text size={0} style={{color: COLORS.muted}}>
            {description}
          </Text>
        )}
      </Stack>
    </Card>
  )
}

function ChartContainer({children}: {children: React.ReactNode}) {
  return (
    <Card padding={3} radius={2} shadow={1} style={{backgroundColor: COLORS.cardBg, borderColor: COLORS.border}}>
      <div style={{height: '350px'}}>
        {children}
      </div>
    </Card>
  )
}

function OrderCard({order}: {order: any}) {
  return (
    <Card padding={3} radius={2} style={{backgroundColor: COLORS.cardBg, borderColor: COLORS.border}}>
      <Stack space={3}>
        <Flex justify="space-between" align="center">
          <Text size={1} weight="medium" style={{color: COLORS.muted}}>
            {new Date(order._createdAt).toLocaleDateString()}
          </Text>
          <Badge status={order.status} />
        </Flex>
        
        <Text size={1} weight="medium" style={{color: COLORS.text}}>
          {order.customer || 'Anonymous Customer'}
        </Text>
        
        <Flex justify="space-between" align="center">
          <Text size={1} style={{color: COLORS.muted}}>
            {order.items} item{order.items !== 1 ? 's' : ''}
          </Text>
          <Text size={1} style={{color: COLORS.primary}}>
            View Details
          </Text>
        </Flex>
      </Stack>
    </Card>
  )
}

function Badge({status}: {status: string}) {
  const color = getStatusColor(status)
  const bgColor = getStatusColor(status, true)
  
  return (
    <Box
      padding={1}
      paddingLeft={2}
      paddingRight={2}
      style={{
        backgroundColor: bgColor,
        color: color,
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'capitalize'
      }}
    >
      {formatStatus(status)}
    </Box>
  )
}

function EmptyState({message}: {message: string}) {
  return (
    <Card padding={4} radius={2} shadow={1} style={{backgroundColor: COLORS.cardBg, textAlign: 'center', borderColor: COLORS.border}}>
      <Text size={2} style={{color: COLORS.muted}}>
        {message}
      </Text>
    </Card>
  )
}

// Helper functions
function formatStatus(status: string): string {
  return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function formatCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function getStatusColor(status: string, background = false): string {
  switch(status) {
    case 'pending': 
      return background ? 'rgba(245, 158, 11, 0.2)' : '#F59E0B' // Amber
    case 'processing': 
      return background ? 'rgba(59, 130, 246, 0.2)' : '#3B82F6' // Blue
    case 'shipped': 
      return background ? 'rgba(139, 92, 246, 0.2)' : '#8B5CF6' // Purple
    case 'out_for_delivery': 
      return background ? 'rgba(167, 139, 250, 0.2)' : '#A78BFA' // Violet
    case 'delivered': 
      return background ? 'rgba(16, 185, 129, 0.2)' : '#10B981' // Emerald
    case 'paid': 
      return background ? 'rgba(16, 185, 129, 0.2)' : '#10B981' // Emerald
    case 'cancelled': 
      return background ? 'rgba(239, 68, 68, 0.2)' : '#EF4444' // Red
    default: 
      return background ? 'rgba(156, 163, 175, 0.2)' : '#9CA3AF' // Gray
  }
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
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: COLORS.text,
        font: {
          size: 16
        }
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
        grid: {
          display: false,
          color: COLORS.border
        },
        ticks: {
          color: COLORS.muted
        }
      },
      y: {
        grid: {
          color: COLORS.border
        },
        ticks: {
          color: COLORS.muted
        }
      }
    }
  }
}