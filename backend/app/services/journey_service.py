"""
Journey Service: Filtering, Searching, and Multi-Criteria Sorting Engine
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.supabase_client import DatabaseRepository
from app.models.schemas import SearchFilters, SortOption

CITY_SYNONYMS = {
    "bangalore": "bengaluru",
    "bengaluru": "bengaluru",
    "blr": "bengaluru",
    "madras": "chennai",
    "chennai": "chennai",
    "maa": "chennai",
    "bombay": "mumbai",
    "mumbai": "mumbai",
    "bom": "mumbai",
    "new delhi": "delhi",
    "delhi": "delhi",
    "del": "delhi",
    "hyderabad": "hyderabad",
    "hyd": "hyderabad",
    "secunderabad": "hyderabad",
    "pune": "pune",
    "pnq": "pune",
    "goa": "goa",
    "goi": "goa"
}

def normalize_city(name: str) -> str:
    cleaned = name.strip().lower()
    return CITY_SYNONYMS.get(cleaned, cleaned)

def get_time_slot(iso_time_str: str) -> str:
    try:
        # e.g. 2026-10-12T06:15:00
        dt_part = iso_time_str.split("T")[1]
        hour = int(dt_part.split(":")[0])
        if 4 <= hour < 8:
            return "early_morning"
        elif 8 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 21:
            return "evening"
        else:
            return "night"
    except Exception:
        return "morning"

class JourneyService:

    @classmethod
    async def search_journeys(
        cls,
        origin: str,
        destination: str,
        date: Optional[str] = None,
        modes: Optional[List[str]] = None,
        filters: Optional[SearchFilters] = None,
        sort_by: Optional[str] = "recommended"
    ) -> List[Dict[str, Any]]:
        all_journeys = await DatabaseRepository.get_all_journeys()
        
        orig_norm = normalize_city(origin) if origin else ""
        dest_norm = normalize_city(destination) if destination else ""

        results = []
        for j in all_journeys:
            orig_data = j.get("origin") if isinstance(j.get("origin"), dict) else {}
            dest_data = j.get("destination") if isinstance(j.get("destination"), dict) else {}

            j_orig_city = normalize_city(orig_data.get("city") or j.get("origin_city") or "")
            j_dest_city = normalize_city(dest_data.get("city") or j.get("destination_city") or "")
            orig_name = (orig_data.get("name") or "").lower()
            dest_name = (dest_data.get("name") or "").lower()

            # Match origin and destination if provided
            if orig_norm and orig_norm not in j_orig_city and orig_norm not in orig_name:
                continue
            if dest_norm and dest_norm not in j_dest_city and dest_norm not in dest_name:
                continue

            # Match mode if filtered
            j_modes = j.get("modes") or [j.get("mode", "flight")]
            if modes and len(modes) > 0:
                if not any(m in modes for m in j_modes):
                    continue

            # Filter checks
            if filters:
                if filters.min_budget is not None and j["total_fare"] < filters.min_budget:
                    continue
                if filters.max_budget is not None and j["total_fare"] > filters.max_budget:
                    continue
                if filters.max_duration_minutes is not None and j["total_duration_minutes"] > filters.max_duration_minutes:
                    continue
                if filters.time_of_day and len(filters.time_of_day) > 0:
                    slot = get_time_slot(j["departure_time"])
                    if slot not in filters.time_of_day:
                        continue
                if filters.max_transfers is not None and j["transfers_count"] > filters.max_transfers:
                    continue
                
                # Mode specific filters
                first_leg = j["legs"][0] if j["legs"] else None
                if first_leg:
                    # Flight specific
                    if filters.flight_airlines and first_leg["operator"] not in filters.flight_airlines:
                        continue
                    if filters.flight_direct_only and j["transfers_count"] > 0:
                        continue
                    if filters.flight_cabin_class and first_leg["class_or_category"] not in filters.flight_cabin_class:
                        continue
                    
                    # Train specific
                    if filters.train_classes and first_leg["class_or_category"] not in filters.train_classes:
                        continue
                    
                    # Bus specific
                    if filters.bus_operators and first_leg["operator"] not in filters.bus_operators:
                        continue
                    if filters.bus_ac_only and "AC" not in first_leg["class_or_category"]:
                        continue

            if date:
                # Project schedule onto requested travel date
                j_copy = dict(j)
                try:
                    orig_dep = j.get("departure_time", "")
                    orig_arr = j.get("arrival_time", "")
                    
                    dep_time_part = orig_dep.split("T")[1] if "T" in orig_dep else orig_dep
                    arr_time_part = orig_arr.split("T")[1] if "T" in orig_arr else orig_arr
                    
                    # Detect if original journey spanned overnight
                    days_span = 0
                    if "T" in orig_dep and "T" in orig_arr:
                        d_dep = datetime.fromisoformat(orig_dep).date()
                        d_arr = datetime.fromisoformat(orig_arr).date()
                        days_span = max(0, (d_arr - d_dep).days)
                    
                    target_dep_d = datetime.strptime(date, "%Y-%m-%d").date()
                    target_arr_d = target_dep_d + timedelta(days=days_span)
                    
                    j_copy["departure_time"] = f"{target_dep_d.strftime('%Y-%m-%d')}T{dep_time_part}"
                    j_copy["arrival_time"] = f"{target_arr_d.strftime('%Y-%m-%d')}T{arr_time_part}"
                    
                    # Also align legs if present
                    if j.get("legs"):
                        projected_legs = []
                        for leg in j["legs"]:
                            l_copy = dict(leg)
                            l_dep = l_copy.get("departure_time", "")
                            l_arr = l_copy.get("arrival_time", "")
                            l_dep_t = l_dep.split("T")[1] if "T" in l_dep else l_dep
                            l_arr_t = l_arr.split("T")[1] if "T" in l_arr else l_arr
                            l_span = 0
                            if "T" in l_dep and "T" in l_arr:
                                l_span = max(0, (datetime.fromisoformat(l_arr).date() - datetime.fromisoformat(l_dep).date()).days)
                            l_copy["departure_time"] = f"{target_dep_d.strftime('%Y-%m-%d')}T{l_dep_t}"
                            l_copy["arrival_time"] = f"{(target_dep_d + timedelta(days=l_span)).strftime('%Y-%m-%d')}T{l_arr_t}"
                            projected_legs.append(l_copy)
                        j_copy["legs"] = projected_legs
                    
                    results.append(j_copy)
                except Exception:
                    results.append(j)
            else:
                results.append(j)

        # Sorting logic
        if sort_by == "cheapest":
            results.sort(key=lambda x: x["total_fare"])
        elif sort_by == "fastest":
            results.sort(key=lambda x: x["total_duration_minutes"])
        elif sort_by == "earliest_arrival":
            results.sort(key=lambda x: x["arrival_time"])
        else: # recommended
            results.sort(key=lambda x: x.get("recommended_score", 80), reverse=True)

        return results

    @classmethod
    async def get_journey_by_id(cls, journey_id: str) -> Optional[Dict[str, Any]]:
        if not journey_id:
            return None
        all_journeys = await DatabaseRepository.get_all_journeys()
        for j in all_journeys:
            if j.get("id") == journey_id:
                return j
        from app.services.multimodal_service import MultimodalService
        return MultimodalService.get_composed_journey(journey_id)
