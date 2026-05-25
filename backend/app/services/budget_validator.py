from decimal import Decimal
from datetime import date

class BudgetValidator:
    """
    Validates if a trip budget is realistic based on:
    - Destination and origin
    - Duration
    - Number of travellers
    - Hotel and transport preferences
    - Currency
    """
    
    # Base costs in INR (adjust for your currencies)
    BASE_TRANSPORT_COST = {
        "flight": 3000,
        "train": 1000,
        "bus": 500,
        "car": 2000
    }
    
    HOTEL_COST_PER_NIGHT = {
        "budget": 1500,
        "mid-range": 4000,
        "premium": 10000
    }
    
    FOOD_COST_PER_DAY = {
        "budget": 500,
        "mid-range": 1500,
        "premium": 3000
    }
    
    LOCAL_TRANSPORT_PER_DAY = {
        "public": 200,
        "taxi": 800,
        "car": 1500
    }
    
    ACTIVITY_COST_PER_DAY = {
        "relaxed": 500,
        "balanced": 1500,
        "packed": 3000
    }
    
    DISTANCE_MULTIPLIERS = {
        "same_city": 1,
        "same_state": 1.2,
        "domestic": 1.5,
        "international": 2.5
    }
    
    def validate_budget(
        self,
        source_city: str,
        destination: str,
        num_days: int,
        num_travellers: int,
        hotel_preference: str,
        transport_preference: str,
        budget: Decimal,
        currency: str,
        food_preference: str = "mid-range",
        pace: str = "balanced",
        local_transport_preference: str = "public"
    ) -> dict:
        """
        Validate if budget is realistic
        
        Returns:
        {
            "is_realistic": bool,
            "message": str,
            "minimum_budget": Decimal,
            "cost_breakdown": dict,
            "suggested_adjustments": list
        }
        """
        
        # Minimum days is 1
        if num_days < 1:
            num_days = 1
        
        # Calculate minimum realistic budget
        minimum = self._calculate_minimum_budget(
            source_city=source_city,
            destination=destination,
            num_days=num_days,
            num_travellers=num_travellers,
            hotel_preference=hotel_preference,
            transport_preference=transport_preference,
            food_preference=food_preference,
            pace=pace,
            local_transport_preference=local_transport_preference
        )
        
        # Check if provided budget is at least 80% of minimum
        budget_threshold = Decimal("0.8") * minimum["total"]
        is_realistic = budget >= budget_threshold
        
        # Generate message
        if is_realistic:
            message = f"Budget is realistic for this trip. Estimated cost: ₹{minimum['total']}"
        else:
            shortfall = minimum["total"] - budget
            message = f"Budget appears low. Estimated minimum: ₹{minimum['total']} (shortfall: ₹{shortfall})"
        
        # Suggest adjustments if budget is tight
        suggestions = []
        if not is_realistic:
            suggestions = self._suggest_adjustments(
                budget=budget,
                minimum=minimum,
                num_days=num_days,
                hotel_preference=hotel_preference,
                transport_preference=transport_preference
            )
        
        return {
            "is_realistic": is_realistic,
            "message": message,
            "minimum_budget": str(minimum["total"]),
            "cost_breakdown": {
                "transport": str(minimum["transport"]),
                "stay": str(minimum["stay"]),
                "food": str(minimum["food"]),
                "local_transport": str(minimum["local_transport"]),
                "activities": str(minimum["activities"]),
                "buffer": str(minimum["buffer"])
            },
            "suggested_adjustments": suggestions
        }
    
    def _calculate_minimum_budget(
        self,
        source_city: str,
        destination: str,
        num_days: int,
        num_travellers: int,
        hotel_preference: str,
        transport_preference: str,
        food_preference: str,
        pace: str,
        local_transport_preference: str
    ) -> dict:
        """Calculate minimum realistic budget components"""
        
        # Transport cost (round trip per person)
        transport_base = self.BASE_TRANSPORT_COST.get(transport_preference, 3000)
        distance_multiplier = self._get_distance_multiplier(source_city, destination)
        transport_cost = Decimal(transport_base * distance_multiplier * num_travellers)
        
        # Hotel cost
        hotel_per_night = Decimal(self.HOTEL_COST_PER_NIGHT.get(hotel_preference, 4000))
        stay_cost = hotel_per_night * (num_days - 1) * num_travellers  # -1 for last day
        
        # Food cost
        food_per_day = Decimal(self.FOOD_COST_PER_DAY.get(food_preference, 1500))
        food_cost = food_per_day * num_days * num_travellers
        
        # Local transport cost
        local_transport_per_day = Decimal(self.LOCAL_TRANSPORT_PER_DAY.get(local_transport_preference, 200))
        local_transport_cost = local_transport_per_day * num_days * num_travellers
        
        # Activity cost
        activity_per_day = Decimal(self.ACTIVITY_COST_PER_DAY.get(pace, 1500))
        activity_cost = activity_per_day * num_days * num_travellers
        
        # 10% buffer for miscellaneous
        subtotal = transport_cost + stay_cost + food_cost + local_transport_cost + activity_cost
        buffer = subtotal * Decimal("0.1")
        
        total = subtotal + buffer
        
        return {
            "transport": transport_cost,
            "stay": stay_cost,
            "food": food_cost,
            "local_transport": local_transport_cost,
            "activities": activity_cost,
            "buffer": buffer,
            "total": total
        }
    
    def _get_distance_multiplier(self, source: str, destination: str) -> float:
        """Get distance multiplier based on source-destination pair"""
        # TODO: Implement real city distance logic or API call
        # For now, use simple heuristic
        return 1.5  # Default multiplier for domestic trip
    
    def _suggest_adjustments(
        self,
        budget: Decimal,
        minimum: dict,
        num_days: int,
        hotel_preference: str,
        transport_preference: str
    ) -> list:
        """Suggest ways to adjust trip to fit budget"""
        suggestions = []
        
        shortfall = minimum["total"] - budget
        
        # Suggest reducing days
        cost_per_day = minimum["total"] / num_days if num_days > 0 else 0
        days_to_cut = int(shortfall / cost_per_day) + 1
        if days_to_cut > 0 and days_to_cut < num_days:
            suggestions.append(f"Reduce trip to {num_days - days_to_cut} days")
        
        # Suggest changing hotel preference
        if hotel_preference == "premium":
            suggestions.append("Consider mid-range hotels instead of premium")
        elif hotel_preference == "mid-range":
            suggestions.append("Consider budget hotels instead of mid-range")
        
        # Suggest changing transport
        if transport_preference == "flight":
            suggestions.append("Consider train or bus instead of flight")
        
        # Suggest increasing budget
        suggestions.append(f"Increase budget by ₹{shortfall:.0f} to be comfortable")
        
        return suggestions
