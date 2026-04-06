import { Link } from 'react-router-dom'
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Zap,
      title: "17-Second Decision",
      description: "Get instant loan decisions powered by AI, not weeks of waiting."
    },
    {
      icon: Shield,
      title: "Ghana Card Verified",
      description: "Secure NIA integration for instant identity verification."
    },
    {
      icon: TrendingUp,
      title: "Credit Coach",
      description: "Personalized plans to improve your credit score and get better rates."
    },
    {
      icon: Users,
      title: "MoMo Integration",
      description: "Instant disbursement and easy repayment via mobile money."
    }
  ]

  const stats = [
    { value: "60%", label: "of Ghanaians now lendable" },
    { value: "17s", label: "average decision time" },
    { value: "72%", label: "AI accuracy rate" },
    { value: "11.71%", label: "current GRR" }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-ghana-green overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-ghana-gold rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-ghana-green rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-ghana-gold/20 text-ghana-gold px-4 py-2 rounded-full text-sm mb-6">
                <Star size={16} />
                Ghana's #1 AI Loan Platform
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                Get Loan Approval in{' '}
                <span className="text-ghana-gold">17 Seconds</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">
                AI-powered credit scoring that includes the 60% of Ghanaians 
                who are "credit invisible". No more waiting weeks for decisions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register" 
                  className="bg-ghana-gold text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-ghana-gold/90 flex items-center justify-center gap-2"
                >
                  Apply Now
                  <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/calculator" 
                  className="border border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 text-center"
                >
                  Try Calculator
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-8 text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-ghana-green" />
                  No hidden fees
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-ghana-green" />
                  Instant MoMo disbursement
                </div>
              </div>
            </div>

            {/* Hero Image/Card */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🇬🇭</div>
                  <h3 className="text-white text-xl font-semibold">Quick Assessment</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between text-gray-300 mb-2">
                      <span>Loan Amount</span>
                      <span className="text-ghana-gold font-semibold">GH₵ 25,000</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full">
                      <div className="h-2 bg-ghana-gold rounded-full w-3/4" />
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between text-gray-300 mb-2">
                      <span>Approval Chance</span>
                      <span className="text-green-400 font-semibold">78%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full">
                      <div className="h-2 bg-green-400 rounded-full w-4/5" />
                    </div>
                  </div>
                  
                  <div className="bg-ghana-green/30 rounded-lg p-4 text-center">
                    <span className="text-green-400 font-semibold">✓ Pre-Qualified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-ghana-green mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose LoanAssess?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're not just another loan app. We're building Ghana's financial inclusion infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow card-hover"
              >
                <div className="w-12 h-12 bg-ghana-green/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-ghana-green" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Four simple steps to get your loan
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Apply", desc: "Fill out a simple form with your Ghana Card", time: "2 min" },
              { step: 2, title: "Verify", desc: "We verify your identity instantly", time: "5 sec" },
              { step: 3, title: "Get Decision", desc: "AI analyzes your profile", time: "10 sec" },
              { step: 4, title: "Receive Funds", desc: "Money sent to your MoMo", time: "Instant" }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-ghana-green text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-2">{item.desc}</p>
                <span className="text-sm text-ghana-green font-medium">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-ghana-green">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of Ghanaians who've discovered a faster way to access credit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-ghana-green px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100"
            >
              Create Account
            </Link>
            <Link 
              to="/calculator" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10"
            >
              Check Your Rate
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
