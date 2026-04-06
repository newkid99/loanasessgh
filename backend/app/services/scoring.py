"""
Credit Scoring Engine
=====================
AI-powered credit assessment with Credit Coach recommendations
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from app.core.config import settings

@dataclass
class ScoringResult:
    approval_probability: float
    default_probability: float
    risk_grade: str
    interest_rate: float
    risk_premium: float
    monthly_payment: float
    risk_factors: List[Dict]
    positive_factors: List[Dict]
    credit_coach: Dict
    affordability: Dict

class CreditScoringEngine:
    """
    XGBoost-based credit scoring with Ghana Reference Rate integration
    """
    
    # GRR History for reference
    GRR_CURRENT = settings.CURRENT_GRR
    
    # Risk premium by credit score
    RISK_PREMIUMS = {
        (750, 850): 5.0,   # A
        (700, 749): 7.0,   # B
        (670, 699): 9.0,   # C
        (640, 669): 11.0,  # D
        (600, 639): 14.0,  # E
        (560, 599): 17.0,  # F
        (300, 559): 20.0,  # G
    }
    
    # Feature thresholds for risk analysis
    THRESHOLDS = {
        "loan_amnt": {"high": 50000, "medium": 25000, "direction": "high"},
        "term": {"high": 60, "medium": 48, "direction": "high"},
        "dti": {"high": 40, "medium": 30, "direction": "high"},
        "credit_utilization": {"high": 70, "medium": 40, "direction": "high"},
        "delinquencies": {"high": 2, "medium": 1, "direction": "high"},
        "employment_years": {"high": 1, "medium": 3, "direction": "low"},
        "monthly_income": {"high": 2000, "medium": 4000, "direction": "low"},
    }
    
    def __init__(self):
        self.model = None
        self.imputer = None
        self._load_model()
    
    def _load_model(self):
        """Load pre-trained XGBoost model"""
        try:
            import joblib
            import os
            model_path = os.path.join(os.path.dirname(__file__), "model.joblib")
            imputer_path = os.path.join(os.path.dirname(__file__), "imputer.joblib")
            
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                self.imputer = joblib.load(imputer_path)
                print("✅ ML model loaded successfully")
            else:
                print("⚠️ ML model not found, using rule-based scoring")
        except Exception as e:
            print(f"⚠️ Could not load ML model: {e}")
    
    def calculate_credit_score(self, data: Dict) -> int:
        """
        Calculate credit score (300-850) based on user data
        """
        score = 650  # Base score
        
        # Employment bonus
        emp_years = data.get("employment_years", 0)
        if emp_years >= 5:
            score += 30
        elif emp_years >= 2:
            score += 15
        elif emp_years < 1:
            score -= 20
        
        # DTI impact
        dti = data.get("dti", 30)
        if dti < 20:
            score += 40
        elif dti < 30:
            score += 20
        elif dti > 40:
            score -= 30
        elif dti > 50:
            score -= 50
        
        # Credit utilization
        util = data.get("credit_utilization", 30)
        if util < 30:
            score += 30
        elif util > 70:
            score -= 40
        
        # Delinquencies
        delinq = data.get("delinquencies", 0)
        score -= delinq * 25
        
        # Income relative to loan
        income = data.get("monthly_income", 5000)
        loan = data.get("loan_amount", 20000)
        income_ratio = (income * 12) / max(loan, 1)
        if income_ratio > 3:
            score += 25
        elif income_ratio < 1:
            score -= 35
        
        return max(300, min(850, score))
    
    def get_risk_grade(self, credit_score: int) -> str:
        """Convert credit score to letter grade"""
        if credit_score >= 750:
            return "A"
        elif credit_score >= 700:
            return "B"
        elif credit_score >= 670:
            return "C"
        elif credit_score >= 640:
            return "D"
        elif credit_score >= 600:
            return "E"
        elif credit_score >= 560:
            return "F"
        else:
            return "G"
    
    def get_risk_premium(self, credit_score: int) -> float:
        """Get risk premium based on credit score"""
        for (low, high), premium in self.RISK_PREMIUMS.items():
            if low <= credit_score <= high:
                return premium
        return 20.0  # Default highest premium
    
    def calculate_default_probability(self, data: Dict) -> float:
        """
        Calculate default probability using ML model or rule-based fallback
        """
        if self.model is not None:
            # Use ML model
            try:
                features = self._prepare_features(data)
                X = np.array([features])
                if self.imputer:
                    X = self.imputer.transform(X)
                prob = self.model.predict_proba(X)[0][1]
                return float(prob)
            except Exception as e:
                print(f"ML prediction error: {e}")
        
        # Rule-based fallback
        credit_score = data.get("credit_score", 650)
        dti = data.get("dti", 30)
        delinq = data.get("delinquencies", 0)
        
        # Base probability from credit score
        if credit_score >= 750:
            base_prob = 0.05
        elif credit_score >= 700:
            base_prob = 0.10
        elif credit_score >= 670:
            base_prob = 0.15
        elif credit_score >= 640:
            base_prob = 0.23
        elif credit_score >= 600:
            base_prob = 0.32
        elif credit_score >= 560:
            base_prob = 0.40
        else:
            base_prob = 0.50
        
        # Adjust for DTI
        if dti > 40:
            base_prob += 0.10
        elif dti > 50:
            base_prob += 0.20
        
        # Adjust for delinquencies
        base_prob += delinq * 0.05
        
        return min(0.95, max(0.02, base_prob))
    
    def _prepare_features(self, data: Dict) -> List[float]:
        """Prepare feature vector for ML model"""
        features = [
            data.get("loan_amount", 20000) * 0.08,  # Convert to USD-equivalent
            data.get("term", 36),
            data.get("interest_rate", 20),
            self._grade_to_num(data.get("risk_grade", "C")),
            data.get("employment_years", 5),
            data.get("monthly_income", 5000) * 12 * 0.08,
            data.get("dti", 30),
            data.get("delinquencies", 0),
            data.get("open_accounts", 5),
            data.get("credit_utilization", 30),
            0.06, 0.06, 0.88  # Neutral sentiment
        ]
        return features
    
    def _grade_to_num(self, grade: str) -> int:
        """Convert letter grade to number"""
        return {"A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7}.get(grade, 4)
    
    def calculate_monthly_payment(self, principal: float, annual_rate: float, term_months: int) -> float:
        """Calculate monthly payment using amortization formula"""
        if annual_rate <= 0:
            return principal / term_months
        
        monthly_rate = annual_rate / 100 / 12
        payment = principal * (monthly_rate * (1 + monthly_rate)**term_months) / ((1 + monthly_rate)**term_months - 1)
        return round(payment, 2)
    
    def analyze_risk_factors(self, data: Dict) -> Tuple[List[Dict], List[Dict]]:
        """
        Analyze individual risk factors and categorize as risks or strengths
        """
        risk_factors = []
        positive_factors = []
        
        analyses = [
            {
                "name": "Loan Amount",
                "value": data.get("loan_amount", 0),
                "unit": "GH₵",
                "thresholds": self.THRESHOLDS["loan_amnt"],
                "explanation": "Higher loan amounts increase repayment burden.",
                "recommendation": "Consider requesting a smaller amount."
            },
            {
                "name": "Debt-to-Income",
                "value": data.get("dti", 0),
                "unit": "%",
                "thresholds": self.THRESHOLDS["dti"],
                "explanation": "High DTI means most income goes to debt.",
                "recommendation": "Pay down existing debts first."
            },
            {
                "name": "Credit Utilization",
                "value": data.get("credit_utilization", 0),
                "unit": "%",
                "thresholds": self.THRESHOLDS["credit_utilization"],
                "explanation": "High utilization signals financial stress.",
                "recommendation": "Keep credit card balances below 30%."
            },
            {
                "name": "Employment Length",
                "value": data.get("employment_years", 0),
                "unit": " years",
                "thresholds": self.THRESHOLDS["employment_years"],
                "explanation": "Short employment history suggests instability.",
                "recommendation": "Stay at current employer for 2+ years."
            },
            {
                "name": "Delinquencies",
                "value": data.get("delinquencies", 0),
                "unit": "",
                "thresholds": self.THRESHOLDS["delinquencies"],
                "explanation": "Late payments predict future problems.",
                "recommendation": "Maintain perfect payment history."
            },
        ]
        
        for item in analyses:
            val = item["value"]
            thresh = item["thresholds"]
            direction = thresh["direction"]
            
            # Determine risk level
            is_risk = False
            level = None
            
            if direction == "high":
                if val >= thresh["high"]:
                    level = "critical"
                    is_risk = True
                elif val >= thresh["medium"]:
                    level = "warning"
                    is_risk = True
            else:  # low is bad
                if val <= thresh["high"]:
                    level = "critical"
                    is_risk = True
                elif val <= thresh["medium"]:
                    level = "warning"
                    is_risk = True
            
            factor = {
                "name": item["name"],
                "value": val,
                "unit": item["unit"],
                "level": level,
                "explanation": item["explanation"],
                "recommendation": item["recommendation"]
            }
            
            if is_risk:
                risk_factors.append(factor)
            else:
                positive_factors.append(factor)
        
        # Sort risks by severity
        risk_factors.sort(key=lambda x: 0 if x["level"] == "critical" else 1)
        
        return risk_factors, positive_factors
    
    def generate_credit_coach(self, data: Dict, risk_factors: List[Dict]) -> Dict:
        """
        Generate personalized Credit Coach recommendations
        """
        current_score = data.get("credit_score", 650)
        target_score = min(current_score + 50, 750)
        
        # Generate action plan
        actions = []
        estimated_weeks = 0
        
        for factor in risk_factors[:3]:  # Top 3 issues
            if factor["name"] == "Credit Utilization":
                actions.append({
                    "action": f"Pay down credit cards to reduce utilization to 30%",
                    "impact": "+15-25 points",
                    "timeframe": "4-8 weeks"
                })
                estimated_weeks = max(estimated_weeks, 8)
            
            elif factor["name"] == "Delinquencies":
                actions.append({
                    "action": "Set up automatic payments to avoid late payments",
                    "impact": "+10-20 points over time",
                    "timeframe": "Immediate + 6 months"
                })
                estimated_weeks = max(estimated_weeks, 24)
            
            elif factor["name"] == "Debt-to-Income":
                actions.append({
                    "action": "Pay extra on highest-rate debts each month",
                    "impact": "+10-15 points",
                    "timeframe": "3-6 months"
                })
                estimated_weeks = max(estimated_weeks, 24)
            
            elif factor["name"] == "Employment Length":
                actions.append({
                    "action": "Stay at current employer and document income",
                    "impact": "+5-10 points",
                    "timeframe": "3-6 months"
                })
                estimated_weeks = max(estimated_weeks, 24)
        
        if not actions:
            actions.append({
                "action": "Maintain your good financial habits",
                "impact": "Stable score",
                "timeframe": "Ongoing"
            })
        
        return {
            "current_score": current_score,
            "target_score": target_score,
            "estimated_weeks_to_target": estimated_weeks,
            "actions": actions,
            "projected_rate_improvement": f"{data.get('interest_rate', 20):.1f}% → {max(self.GRR_CURRENT + 5, data.get('interest_rate', 20) - 3):.1f}%",
            "message": "Follow this plan to improve your approval chances!"
        }
    
    def calculate_affordability(self, monthly_income: float, monthly_expenses: float, monthly_payment: float) -> Dict:
        """
        Calculate loan affordability
        """
        disposable = monthly_income - monthly_expenses
        
        if disposable <= 0:
            return {
                "status": "unaffordable",
                "message": "Your expenses exceed your income.",
                "payment_to_income": 100,
                "remaining_after_payment": 0,
                "can_afford": False
            }
        
        payment_ratio = (monthly_payment / disposable) * 100
        remaining = disposable - monthly_payment
        
        if payment_ratio <= 30 and remaining >= monthly_income * 0.1:
            status = "comfortable"
            message = "This loan fits comfortably in your budget."
            can_afford = True
        elif payment_ratio <= 50 and remaining > 0:
            status = "manageable"
            message = "This loan is manageable but will be tight."
            can_afford = True
        else:
            status = "stretched"
            message = "This loan may strain your finances significantly."
            can_afford = False
        
        return {
            "status": status,
            "message": message,
            "payment_to_income": round(payment_ratio, 1),
            "remaining_after_payment": round(remaining, 2),
            "can_afford": can_afford
        }
    
    def assess(self, data: Dict) -> ScoringResult:
        """
        Main assessment method - returns complete scoring result
        """
        # Calculate credit score
        credit_score = self.calculate_credit_score(data)
        data["credit_score"] = credit_score
        
        # Get risk grade and premium
        risk_grade = self.get_risk_grade(credit_score)
        risk_premium = self.get_risk_premium(credit_score)
        interest_rate = self.GRR_CURRENT + risk_premium
        data["risk_grade"] = risk_grade
        data["interest_rate"] = interest_rate
        
        # Calculate probabilities
        default_prob = self.calculate_default_probability(data)
        approval_prob = 1 - default_prob
        
        # Calculate payment
        loan_amount = data.get("loan_amount", 20000)
        term = data.get("term", 36)
        monthly_payment = self.calculate_monthly_payment(loan_amount, interest_rate, term)
        
        # Analyze risk factors
        risk_factors, positive_factors = self.analyze_risk_factors(data)
        
        # Generate credit coach recommendations
        credit_coach = self.generate_credit_coach(data, risk_factors)
        
        # Calculate affordability
        affordability = self.calculate_affordability(
            data.get("monthly_income", 5000),
            data.get("monthly_expenses", 3000),
            monthly_payment
        )
        
        return ScoringResult(
            approval_probability=round(approval_prob, 4),
            default_probability=round(default_prob, 4),
            risk_grade=risk_grade,
            interest_rate=round(interest_rate, 2),
            risk_premium=round(risk_premium, 2),
            monthly_payment=monthly_payment,
            risk_factors=risk_factors,
            positive_factors=positive_factors,
            credit_coach=credit_coach,
            affordability=affordability
        )


# Singleton instance
scoring_engine = CreditScoringEngine()
