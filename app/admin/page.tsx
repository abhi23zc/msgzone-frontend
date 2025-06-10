import {
  CreditCard,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Users,
  UserX,
} from "lucide-react";

const cards = [
  {
    title: "Active Users",
    value: "1,234",
    change: "+12% from yesterday",
    trend: "up",
    icon: Users,
    style: {
      bg: "from-emerald-50 to-teal-50",
      icon: "from-emerald-500 to-teal-600",
      text: "text-emerald-600",
      change: "text-emerald-500"
    }
  },
  {
    title: "Inactive Users", 
    value: "89",
    change: "-3% from yesterday",
    trend: "down",
    icon: UserX,
    style: {
      bg: "from-red-50 to-rose-50",
      icon: "from-red-500 to-rose-600", 
      text: "text-red-600",
      change: "text-red-500"
    }
  },
  {
    title: "Messages Sent Today",
    value: "15,847", 
    change: "+25% from yesterday",
    trend: "up",
    icon: MessageCircle,
    style: {
      bg: "from-blue-50 to-indigo-50",
      icon: "from-blue-500 to-indigo-600",
      text: "text-blue-600",
      change: "text-blue-500"
    }
  },
  {
    title: "Payments Today",
    value: "₹45,231",
    change: "+18% from yesterday", 
    trend: "up",
    icon: CreditCard,
    style: {
      bg: "from-purple-50 to-violet-50",
      icon: "from-purple-500 to-violet-600",
      text: "text-purple-600",
      change: "text-purple-500"
    }
  }
];

function DashboardPage() {
  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your key metrics and performance indicators</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${card.style.bg} rounded-2xl p-6 shadow hover:shadow-lg transition-all`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${card.style.icon} rounded-xl shadow mb-4`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  {card.title}
                </h3>
                
                <p className={`text-3xl font-bold ${card.style.text}`}>
                  {card.value}
                </p>

                <div className="flex items-center gap-1">
                  {card.trend === "up" ? (
                    <TrendingUp className={`w-4 h-4 ${card.style.change}`} />
                  ) : (
                    <TrendingDown className={`w-4 h-4 ${card.style.change}`} />
                  )}
                  <span className={`text-sm font-medium ${card.style.change}`}>
                    {card.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
