import openai
from typing import List, Dict
import json
from datetime import datetime, timedelta

class InsightsGenerator:
    def __init__(self, api_key: str):
        openai.api_key = api_key
        self.model = "gpt-4"
        self.system_prompt = """You are a financial advisor AI that provides personalized spending insights based on user's expense data.
        Your responses should be:
        1. Actionable and specific
        2. Data-driven
        3. Personalized to the user's spending patterns
        4. Focused on potential savings opportunities
        5. Written in a friendly, conversational tone"""

    def generate_insights(self, expenses: List[Dict], time_period: str = "monthly") -> str:
        expenses_summary = self._prepare_expenses_summary(expenses, time_period)
        
        prompt = f"""Based on the following expense data for the {time_period} period, provide personalized insights and recommendations:
        
        {expenses_summary}
        
        Please provide:
        1. Key spending patterns
        2. Potential areas for savings
        3. Specific recommendations
        4. Comparison with previous period (if available)
        
        Keep the response concise and actionable."""

        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content

    def _prepare_expenses_summary(self, expenses: List[Dict], time_period: str) -> str:
        summary = {
            "total_spending": sum(expense["amount"] for expense in expenses),
            "category_breakdown": {},
            "top_merchants": {},
            "average_daily_spend": 0
        }

        for expense in expenses:
            category = expense["category"]
            merchant = expense["merchant"]
            
            summary["category_breakdown"][category] = summary["category_breakdown"].get(category, 0) + expense["amount"]
            summary["top_merchants"][merchant] = summary["top_merchants"].get(merchant, 0) + expense["amount"]

        if time_period == "monthly":
            days = 30
        elif time_period == "weekly":
            days = 7
        else:
            days = 1

        summary["average_daily_spend"] = summary["total_spending"] / days

        return json.dumps(summary, indent=2)

    def generate_budget_recommendations(self, expenses: List[Dict], income: float) -> str:
        prompt = f"""Based on the following financial data, provide personalized budget recommendations:
        
        Monthly Income: ${income}
        Current Expenses: {json.dumps(expenses, indent=2)}
        
        Please provide:
        1. Recommended budget allocation by category
        2. Specific savings targets
        3. Tips for staying within budget
        4. Potential areas for cost reduction"""

        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content 