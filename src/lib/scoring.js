export function calculateScore(lead) {
    let score = 0
  
    // Source scoring
    const sourceScores = {
      referral: 30,
      whatsapp: 25,
      instagram: 20,
      website: 15,
      manual: 10,
    }
    score += sourceScores[lead.source] || 10
  
    // Budget scoring
    const budgetScores = {
      high: 35,
      medium: 20,
      low: 5,
    }
    score += budgetScores[lead.budget_range] || 0
  
    // Urgency scoring
    const urgencyScores = {
      immediate: 35,
      thisweek: 20,
      normal: 10,
      justlooking: 0,
    }
    score += urgencyScores[lead.urgency] || 10
  
    // Service type bonus (service businesses = higher intent)
    const serviceBonus = {
      clinic: 10,
      salon: 8,
      repair: 9,
      other: 5,
    }
    score += serviceBonus[lead.service_type] || 5
  
    // Determine priority
    let priority = 'cold'
    if (score >= 70) priority = 'hot'
    else if (score >= 40) priority = 'warm'
  
    // Conversion probability (rough %)
    const conversion_probability = Math.min(Math.round(score * 1.1), 95)
  
    return { score, priority, conversion_probability }
  }
  
  export function getPriorityColor(priority) {
    const colors = {
      hot: 'bg-red-100 text-red-700',
      warm: 'bg-yellow-100 text-yellow-700',
      cold: 'bg-blue-100 text-blue-700',
    }
    return colors[priority] || colors.cold
  }
  
  export function getStatusColor(status) {
    const colors = {
      new: 'bg-purple-100 text-purple-700',
      contacted: 'bg-blue-100 text-blue-700',
      quoted: 'bg-yellow-100 text-yellow-700',
      won: 'bg-green-100 text-green-700',
      lost: 'bg-gray-100 text-gray-600',
    }
    return colors[status] || colors.new
  }