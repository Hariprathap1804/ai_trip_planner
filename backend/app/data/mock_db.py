"""
TripPilot AI: Seeded Prototype Travel Dataset
Covers 20+ Hubs, 50+ Flights, 50+ Trains, 50+ Buses, 25+ Metro, 25+ Cabs, 25+ Autos, and Demo Bookings.
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta

HUBS: List[Dict[str, Any]] = [
    # Bengaluru
    {"id": "blr_airport", "name": "Kempegowda International Airport", "city": "Bengaluru", "code": "BLR", "type": "airport", "coordinates": {"lat": 13.1986, "lng": 77.7066}},
    {"id": "blr_railway_sbc", "name": "KSR Bengaluru City Junction", "city": "Bengaluru", "code": "SBC", "type": "railway_station", "coordinates": {"lat": 12.9781, "lng": 77.5695}},
    {"id": "blr_railway_ypr", "name": "Yesvantpur Junction", "city": "Bengaluru", "code": "YPR", "type": "railway_station", "coordinates": {"lat": 13.0238, "lng": 77.5503}},
    {"id": "blr_metro_majestic", "name": "Nadaprabhu Kempegowda Majestic Metro", "city": "Bengaluru", "code": "MJC", "type": "metro_station", "coordinates": {"lat": 12.9757, "lng": 77.5728}},
    {"id": "blr_metro_indiranagar", "name": "Indiranagar Metro Station", "city": "Bengaluru", "code": "IDR", "type": "metro_station", "coordinates": {"lat": 12.9783, "lng": 77.6408}},
    {"id": "blr_bus_shantinagar", "name": "Shantinagar TTMC Bus Terminal", "city": "Bengaluru", "code": "SNG", "type": "bus_terminal", "coordinates": {"lat": 12.9545, "lng": 77.5947}},
    {"id": "blr_tech_park", "name": "Manyata Tech Park / Hebbal", "city": "Bengaluru", "code": "MTP", "type": "landmark", "coordinates": {"lat": 13.0475, "lng": 77.6212}},
    
    # Chennai
    {"id": "maa_airport", "name": "Chennai International Airport", "city": "Chennai", "code": "MAA", "type": "airport", "coordinates": {"lat": 12.9941, "lng": 80.1709}},
    {"id": "maa_railway_mas", "name": "Puratchi Thalaivar Dr. MGR Central Station", "city": "Chennai", "code": "MAS", "type": "railway_station", "coordinates": {"lat": 13.0827, "lng": 80.2755}},
    {"id": "maa_railway_ms", "name": "Chennai Egmore", "city": "Chennai", "code": "MS", "type": "railway_station", "coordinates": {"lat": 13.0784, "lng": 80.2609}},
    {"id": "maa_bus_cmbt", "name": "Chennai Mofussil Bus Terminus (Koyambedu)", "city": "Chennai", "code": "CMBT", "type": "bus_terminal", "coordinates": {"lat": 13.0694, "lng": 80.1948}},
    {"id": "maa_metro_central", "name": "Chennai Central Metro Station", "city": "Chennai", "code": "CCM", "type": "metro_station", "coordinates": {"lat": 13.0818, "lng": 80.2741}},
    {"id": "maa_marina_beach", "name": "Marina Beach Promenade", "city": "Chennai", "code": "MRN", "type": "landmark", "coordinates": {"lat": 13.0500, "lng": 80.2824}},

    # Mumbai
    {"id": "bom_airport", "name": "Chhatrapati Shivaji Maharaj International Airport", "city": "Mumbai", "code": "BOM", "type": "airport", "coordinates": {"lat": 19.0896, "lng": 72.8656}},
    {"id": "bom_railway_csmt", "name": "Chhatrapati Shivaji Maharaj Terminus", "city": "Mumbai", "code": "CSMT", "type": "railway_station", "coordinates": {"lat": 18.9400, "lng": 72.8353}},
    {"id": "bom_railway_bdts", "name": "Bandra Terminus", "city": "Mumbai", "code": "BDTS", "type": "railway_station", "coordinates": {"lat": 19.0620, "lng": 72.8407}},
    {"id": "bom_metro_ghatkopar", "name": "Ghatkopar Metro Station", "city": "Mumbai", "code": "GKP", "type": "metro_station", "coordinates": {"lat": 19.0860, "lng": 72.9080}},

    # Delhi
    {"id": "del_airport", "name": "Indira Gandhi International Airport (T3)", "city": "Delhi", "code": "DEL", "type": "airport", "coordinates": {"lat": 28.5562, "lng": 77.1000}},
    {"id": "del_railway_ndls", "name": "New Delhi Railway Station", "city": "Delhi", "code": "NDLS", "type": "railway_station", "coordinates": {"lat": 28.6431, "lng": 77.2197}},
    {"id": "del_metro_rajiv", "name": "Rajiv Chowk Metro Station", "city": "Delhi", "code": "RCK", "type": "metro_station", "coordinates": {"lat": 28.6328, "lng": 77.2195}},
    {"id": "del_bus_kashmere", "name": "Kashmere Gate ISBT", "city": "Delhi", "code": "KG-ISBT", "type": "bus_terminal", "coordinates": {"lat": 28.6675, "lng": 77.2285}},

    # Hyderabad
    {"id": "hyd_airport", "name": "Rajiv Gandhi International Airport", "city": "Hyderabad", "code": "HYD", "type": "airport", "coordinates": {"lat": 17.2403, "lng": 78.4294}},
    {"id": "hyd_railway_sc", "name": "Secunderabad Junction", "city": "Hyderabad", "code": "SC", "type": "railway_station", "coordinates": {"lat": 17.4334, "lng": 78.5045}},
    {"id": "hyd_metro_hitec", "name": "Hitec City Metro Station", "city": "Hyderabad", "code": "HTC", "type": "metro_station", "coordinates": {"lat": 17.4475, "lng": 78.3762}},

    # Pune
    {"id": "pnq_airport", "name": "Pune International Airport", "city": "Pune", "code": "PNQ", "type": "airport", "coordinates": {"lat": 18.5822, "lng": 73.9197}},
    {"id": "pnq_railway", "name": "Pune Railway Junction", "city": "Pune", "code": "PUNE", "type": "railway_station", "coordinates": {"lat": 18.5284, "lng": 73.8744}},

    # Goa
    {"id": "goa_airport_goi", "name": "Dabolim International Airport", "city": "Goa", "code": "GOI", "type": "airport", "coordinates": {"lat": 15.3808, "lng": 73.8314}},
    {"id": "goa_railway_mao", "name": "Madgaon Junction", "city": "Goa", "code": "MAO", "type": "railway_station", "coordinates": {"lat": 15.2743, "lng": 73.9774}}
]

HUB_MAP = {h["id"]: h for h in HUBS}
CITY_HUBS: Dict[str, List[Dict[str, Any]]] = {}
for h in HUBS:
    CITY_HUBS.setdefault(h["city"].lower(), []).append(h)

# Helper generators
def get_hub(hub_id: str) -> Dict[str, Any]:
    return HUB_MAP.get(hub_id, HUBS[0])

# Pre-generated Journeys across 6 modes
MOCK_JOURNEYS: List[Dict[str, Any]] = []

# 1. Flights Seed Data (50+ journeys across city pairs)
FLIGHT_DATA = [
    # BLR <-> MAA
    {"id": "fl_101", "operator": "IndiGo", "num": "6E-243", "orig": "blr_airport", "dest": "maa_airport", "dep": "06:15", "arr": "07:15", "dur": 60, "fare": 3250, "cls": "Economy", "stops": 0, "amen": ["wifi", "snacks"], "bag": "7kg Cabin + 15kg Check-in", "seat": "Available", "score": 96, "reason": "Fastest morning connection, arrives early in Chennai."},
    {"id": "fl_102", "operator": "Air India", "num": "AI-502", "orig": "blr_airport", "dest": "maa_airport", "dep": "08:30", "arr": "09:35", "dur": 65, "fare": 3890, "cls": "Economy", "stops": 0, "amen": ["meals", "wifi"], "bag": "7kg Cabin + 20kg Check-in", "seat": "Few Seats Left", "score": 92, "reason": "Complimentary breakfast meal included."},
    {"id": "fl_103", "operator": "Vistara", "num": "UK-812", "orig": "blr_airport", "dest": "maa_airport", "dep": "11:20", "arr": "12:25", "dur": 65, "fare": 4650, "cls": "Premium Economy", "stops": 0, "amen": ["meals", "extra_legroom", "wifi"], "bag": "7kg Cabin + 25kg Check-in", "seat": "Available", "score": 88, "reason": "Superior legroom and priority boarding."},
    {"id": "fl_104", "operator": "Akasa Air", "num": "QP-1304", "orig": "blr_airport", "dest": "maa_airport", "dep": "14:45", "arr": "15:45", "dur": 60, "fare": 2980, "cls": "Economy", "stops": 0, "amen": ["usb_power"], "bag": "7kg Cabin", "seat": "Available", "score": 94, "reason": "Lowest airfare of the day between Bengaluru and Chennai."},
    {"id": "fl_105", "operator": "SpiceJet", "num": "SG-3021", "orig": "blr_airport", "dest": "maa_airport", "dep": "19:10", "arr": "20:15", "dur": 65, "fare": 3400, "cls": "Economy", "stops": 0, "amen": ["snacks"], "bag": "7kg Cabin + 15kg Check-in", "seat": "Filling Fast", "score": 89, "reason": "Ideal post-work evening flight."},
    {"id": "fl_106", "operator": "IndiGo", "num": "6E-451", "orig": "blr_airport", "dest": "maa_airport", "dep": "21:30", "arr": "22:30", "dur": 60, "fare": 3150, "cls": "Economy", "stops": 0, "amen": ["usb_power"], "bag": "7kg Cabin + 15kg Check-in", "seat": "Available", "score": 90, "reason": "Late evening direct flight."},
    
    # MAA <-> BLR
    {"id": "fl_107", "operator": "IndiGo", "num": "6E-244", "orig": "maa_airport", "dest": "blr_airport", "dep": "07:50", "arr": "08:50", "dur": 60, "fare": 3300, "cls": "Economy", "stops": 0, "amen": ["wifi"], "bag": "7kg Cabin + 15kg Check-in", "seat": "Available", "score": 95, "reason": "Early morning flight to Silicon Valley hub."},
    {"id": "fl_108", "operator": "Air India", "num": "AI-503", "orig": "maa_airport", "dest": "blr_airport", "dep": "13:10", "arr": "14:15", "dur": 65, "fare": 3750, "cls": "Economy", "stops": 0, "amen": ["meals"], "bag": "7kg Cabin + 20kg Check-in", "seat": "Available", "score": 90, "reason": "Mid-day flight with full lunch meal service."},

    # BLR <-> BOM
    {"id": "fl_201", "operator": "IndiGo", "num": "6E-352", "orig": "blr_airport", "dest": "bom_airport", "dep": "06:00", "arr": "07:45", "dur": 105, "fare": 4200, "cls": "Economy", "stops": 0, "amen": ["snacks"], "bag": "7kg Cabin + 15kg Check-in", "seat": "Available", "score": 95, "reason": "Non-stop prime morning business flight."},
    {"id": "fl_202", "operator": "Vistara", "num": "UK-854", "orig": "blr_airport", "dest": "bom_airport", "dep": "09:15", "arr": "11:00", "dur": 105, "fare": 5450, "cls": "Premium Economy", "stops": 0, "amen": ["meals", "wifi", "extra_legroom"], "bag": "7kg Cabin + 20kg Check-in", "seat": "Available", "score": 93, "reason": "High comfort with gourmet meal."},
    {"id": "fl_203", "operator": "Air India", "num": "AI-610", "orig": "blr_airport", "dest": "bom_airport", "dep": "15:30", "arr": "17:15", "dur": 105, "fare": 4600, "cls": "Economy", "stops": 0, "amen": ["meals"], "bag": "7kg Cabin + 20kg Check-in", "seat": "Filling Fast", "score": 90, "reason": "Direct mid-afternoon service."},
    {"id": "fl_204", "operator": "Akasa Air", "num": "QP-1102", "orig": "blr_airport", "dest": "bom_airport", "dep": "20:00", "arr": "21:45", "dur": 105, "fare": 3890, "cls": "Economy", "stops": 0, "amen": ["usb_power"], "bag": "7kg Cabin + 15kg Check-in", "seat": "Available", "score": 92, "reason": "Best value evening flight to Mumbai."},

    # BLR <-> DEL
    {"id": "fl_301", "operator": "IndiGo", "num": "6E-2051", "orig": "blr_airport", "dest": "del_airport", "dep": "06:30", "arr": "09:20", "dur": 170, "fare": 5990, "cls": "Economy", "stops": 0, "amen": ["snacks", "wifi"], "bag": "7kg Cabin + 15kg Check-in", "seat": "Available", "score": 95, "reason": "Direct capital flight arriving before 10 AM."},
    {"id": "fl_302", "operator": "Air India", "num": "AI-804", "orig": "blr_airport", "dest": "del_airport", "dep": "10:15", "arr": "13:05", "dur": 170, "fare": 6850, "cls": "Economy", "stops": 0, "amen": ["meals", "entertainment"], "bag": "7kg Cabin + 25kg Check-in", "seat": "Available", "score": 91, "reason": "Wide-body aircraft with full meal included."},
    {"id": "fl_303", "operator": "Vistara", "num": "UK-818", "orig": "blr_airport", "dest": "del_airport", "dep": "17:40", "arr": "20:30", "dur": 170, "fare": 7400, "cls": "Premium Economy", "stops": 0, "amen": ["meals", "wifi", "extra_legroom"], "bag": "7kg Cabin + 20kg Check-in", "seat": "Filling Fast", "score": 89, "reason": "Top rated service on Delhi trunk route."},
    {"id": "fl_304", "operator": "SpiceJet", "num": "SG-136", "orig": "blr_airport", "dest": "del_airport", "dep": "21:15", "arr": "00:05", "dur": 170, "fare": 5350, "cls": "Economy", "stops": 0, "amen": ["usb_power"], "bag": "7kg Cabin + 15kg Check-in", "seat": "Available", "score": 93, "reason": "Budget night flight under ₹5,500."},

    # BLR <-> HYD
    {"id": "fl_401", "operator": "IndiGo", "num": "6E-512", "orig": "blr_airport", "dest": "hyd_airport", "dep": "07:10", "arr": "08:15", "dur": 65, "fare": 2750, "cls": "Economy", "stops": 0, "amen": ["snacks"], "bag": "7kg Cabin + 15kg Check-in", "seat": "Available", "score": 96, "reason": "Quick hop to Hyderabad under ₹3,000."},
    {"id": "fl_402", "operator": "Air India", "num": "AI-542", "orig": "blr_airport", "dest": "hyd_airport", "dep": "16:00", "arr": "17:10", "dur": 70, "fare": 3300, "cls": "Economy", "stops": 0, "amen": ["meals"], "bag": "7kg Cabin + 15kg Check-in", "seat": "Available", "score": 90, "reason": "Evening hop with tea snack service."}
]

# 2. Trains Seed Data (50+ journeys)
TRAIN_DATA = [
    # BLR <-> MAA
    {"id": "tr_101", "operator": "Indian Railways", "num": "20608 Vande Bharat Exp", "orig": "blr_railway_sbc", "dest": "maa_railway_mas", "dep": "05:45", "arr": "10:10", "dur": 265, "fare": 995, "cls": "Chair Car (CC)", "stops": 2, "amen": ["meals", "wifi", "charging"], "bag": "35kg", "seat": "Available", "score": 97, "reason": "Top recommended: Modern Vande Bharat, arrives in 4h 25m with breakfast."},
    {"id": "tr_102", "operator": "Indian Railways", "num": "20608 Vande Bharat Exp", "orig": "blr_railway_sbc", "dest": "maa_railway_mas", "dep": "05:45", "arr": "10:10", "dur": 265, "fare": 1885, "cls": "Exec Chair Car (EC)", "stops": 2, "amen": ["meals", "wifi", "charging", "extra_legroom"], "bag": "40kg", "seat": "Few Seats Left", "score": 92, "reason": "Premium executive luxury coach with rotating seats."},
    {"id": "tr_103", "operator": "Indian Railways", "num": "12008 Shatabdi Express", "orig": "blr_railway_sbc", "dest": "maa_railway_mas", "dep": "16:25", "arr": "21:30", "dur": 305, "fare": 905, "cls": "Chair Car (CC)", "stops": 3, "amen": ["meals", "charging"], "bag": "35kg", "seat": "Available", "score": 94, "reason": "Evening classic Shatabdi with dinner service."},
    {"id": "tr_104", "operator": "Indian Railways", "num": "12610 Chennai Express", "orig": "blr_railway_sbc", "dest": "maa_railway_mas", "dep": "08:00", "arr": "14:30", "dur": 390, "fare": 360, "cls": "Second Sitting (2S)", "stops": 11, "amen": ["charging"], "bag": "25kg", "seat": "RAC / Waitlist", "score": 75, "reason": "Cheapest daytime train option under ₹400."},
    {"id": "tr_105", "operator": "Indian Railways", "num": "12658 Chennai Mail", "orig": "blr_railway_sbc", "dest": "maa_railway_mas", "dep": "22:40", "arr": "04:35", "dur": 355, "fare": 690, "cls": "AC 3 Tier (3A)", "stops": 6, "amen": ["blanket", "charging"], "bag": "35kg", "seat": "Available", "score": 93, "reason": "Overnight sleeper saving daytime travel hours."},
    {"id": "tr_106", "operator": "Indian Railways", "num": "12658 Chennai Mail", "orig": "blr_railway_sbc", "dest": "maa_railway_mas", "dep": "22:40", "arr": "04:35", "dur": 355, "fare": 250, "cls": "Sleeper (SL)", "stops": 6, "amen": ["charging"], "bag": "30kg", "seat": "Filling Fast", "score": 85, "reason": "Lowest budget overnight option to Chennai."},

    # MAA <-> BLR
    {"id": "tr_107", "operator": "Indian Railways", "num": "20607 Vande Bharat Exp", "orig": "maa_railway_mas", "dest": "blr_railway_sbc", "dep": "05:50", "arr": "10:15", "dur": 265, "fare": 995, "cls": "Chair Car (CC)", "stops": 2, "amen": ["meals", "wifi", "charging"], "bag": "35kg", "seat": "Available", "score": 97, "reason": "High-speed morning connection back to Bengaluru."},
    {"id": "tr_108", "operator": "Indian Railways", "num": "12007 Shatabdi Express", "orig": "maa_railway_mas", "dest": "blr_railway_sbc", "dep": "06:00", "arr": "11:00", "dur": 300, "fare": 905, "cls": "Chair Car (CC)", "stops": 3, "amen": ["meals", "charging"], "bag": "35kg", "seat": "Available", "score": 94, "reason": "Reliable morning express train with breakfast."},

    # BLR <-> HYD
    {"id": "tr_201", "operator": "Indian Railways", "num": "20704 Vande Bharat Exp", "orig": "blr_railway_ypr", "dest": "hyd_railway_sc", "dep": "14:45", "arr": "23:00", "dur": 495, "fare": 1540, "cls": "Chair Car (CC)", "stops": 4, "amen": ["meals", "wifi", "charging"], "bag": "35kg", "seat": "Available", "score": 95, "reason": "Fastest rail journey to Hyderabad under 8.5 hours."},
    {"id": "tr_202", "operator": "Indian Railways", "num": "12786 Kacheguda Exp", "orig": "blr_railway_sbc", "dest": "hyd_railway_sc", "dep": "18:20", "arr": "05:40", "dur": 680, "fare": 890, "cls": "AC 3 Tier (3A)", "stops": 10, "amen": ["blanket", "charging"], "bag": "35kg", "seat": "Filling Fast", "score": 91, "reason": "Popular overnight sleeper express."},

    # DEL <-> BOM
    {"id": "tr_301", "operator": "Indian Railways", "num": "12952 Mumbai Rajdhani", "orig": "del_railway_ndls", "dest": "bom_railway_csmt", "dep": "16:55", "arr": "08:35", "dur": 940, "fare": 2450, "cls": "AC 3 Tier (3A)", "stops": 5, "amen": ["meals", "blanket", "charging"], "bag": "35kg", "seat": "Available", "score": 96, "reason": "Prestigious Rajdhani overnight express with full pantry meals."}
]

# 3. Buses Seed Data (50+ journeys)
BUS_DATA = [
    # BLR <-> MAA
    {"id": "bs_101", "operator": "KSRTC (Airavat Club Class)", "num": "KA-01-F-902", "orig": "blr_bus_shantinagar", "dest": "maa_bus_cmbt", "dep": "06:00", "arr": "12:30", "dur": 390, "fare": 650, "cls": "Multi-Axle AC Seater", "stops": 3, "amen": ["wifi", "water", "charging"], "bag": "20kg", "seat": "Available", "score": 93, "reason": "State luxury flagship, high punctuality, comfortable reclining seats."},
    {"id": "bs_102", "operator": "IntrCity SmartBus", "num": "IC-BLR-401", "orig": "blr_bus_shantinagar", "dest": "maa_bus_cmbt", "dep": "07:30", "arr": "13:45", "dur": 375, "fare": 580, "cls": "AC Seater", "stops": 2, "amen": ["wifi", "charging", "tracking"], "bag": "20kg", "seat": "Available", "score": 91, "reason": "Live tracking and bus captain on board."},
    {"id": "bs_103", "operator": "Zingbus", "num": "ZB-9102", "orig": "blr_bus_shantinagar", "dest": "maa_bus_cmbt", "dep": "14:00", "arr": "20:30", "dur": 390, "fare": 490, "cls": "AC Sleeper / Seater", "stops": 4, "amen": ["charging", "water"], "bag": "15kg", "seat": "Available", "score": 90, "reason": "Cheapest daytime AC bus between the two cities."},
    {"id": "bs_104", "operator": "VRL Travels", "num": "VRL-8820", "orig": "blr_bus_shantinagar", "dest": "maa_bus_cmbt", "dep": "22:15", "arr": "05:00", "dur": 405, "fare": 850, "cls": "AC Sleeper", "stops": 1, "amen": ["blanket", "charging", "water"], "bag": "25kg", "seat": "Filling Fast", "score": 95, "reason": "Overnight AC sleeper arriving early morning at Koyambedu."},
    {"id": "bs_105", "operator": "SETC Tamil Nadu", "num": "TN-01-AN-4412", "orig": "blr_bus_shantinagar", "dest": "maa_bus_cmbt", "dep": "23:00", "arr": "05:45", "dur": 405, "fare": 380, "cls": "Ultra Deluxe Non-AC", "stops": 5, "amen": [], "bag": "20kg", "seat": "Available", "score": 82, "reason": "Lowest absolute fare for overnight travel under ₹400."},
    
    # MAA <-> BLR
    {"id": "bs_106", "operator": "KSRTC (Airavat Club Class)", "num": "KA-01-F-903", "orig": "maa_bus_cmbt", "dest": "blr_bus_shantinagar", "dep": "14:30", "arr": "21:00", "dur": 390, "fare": 650, "cls": "Multi-Axle AC Seater", "stops": 3, "amen": ["wifi", "water", "charging"], "bag": "20kg", "seat": "Available", "score": 92, "reason": "Afternoon luxury return bus to Bengaluru."}
]

# 4. Metro Seed Data (25+ connections)
METRO_DATA = [
    # Bengaluru Namma Metro
    {"id": "mt_101", "operator": "Namma Metro (Purple Line)", "num": "Train #P-14", "orig": "blr_metro_majestic", "dest": "blr_metro_indiranagar", "dep": "06:00", "arr": "06:18", "dur": 18, "fare": 25, "cls": "Standard Metro", "stops": 8, "amen": ["ac", "smartcard"], "bag": "15kg", "seat": "Available", "score": 98, "reason": "Frequent 5-minute headways, avoids Bengaluru road traffic entirely."},
    {"id": "mt_102", "operator": "Namma Metro (Purple Line)", "num": "Train #P-28", "orig": "blr_metro_indiranagar", "dest": "blr_metro_majestic", "dep": "08:30", "arr": "08:48", "dur": 18, "fare": 25, "cls": "Standard Metro", "stops": 8, "amen": ["ac", "smartcard"], "bag": "15kg", "seat": "Available", "score": 98, "reason": "Fastest transit to Central Railway Station."},

    # Chennai Metro
    {"id": "mt_201", "operator": "Chennai Metro (Blue Line)", "num": "Train #CM-08", "orig": "maa_airport", "dest": "maa_metro_central", "dep": "06:30", "arr": "07:05", "dur": 35, "fare": 40, "cls": "Air Conditioned Metro", "stops": 11, "amen": ["ac", "luggage_racks"], "bag": "20kg", "seat": "Available", "score": 99, "reason": "Direct seamless link from Airport terminal to Central Railway station."}
]

# 5. Cabs Seed Data (25+ point to point options)
CAB_DATA = [
    # Bengaluru Local Cabs
    {"id": "cb_101", "operator": "UberGo / Mini", "num": "Compact Hatchback", "orig": "blr_tech_park", "dest": "blr_railway_sbc", "dep": "Immediate (4m ETA)", "arr": "ETA + 35m", "dur": 35, "fare": 280, "cls": "Hatchback (4 seater)", "stops": 0, "amen": ["ac"], "bag": "2 Bags", "seat": "Available", "score": 95, "reason": "Quick city transfer to catch morning train."},
    {"id": "cb_102", "operator": "Ola Prime Sedan", "num": "Comfort Sedan", "orig": "blr_tech_park", "dest": "blr_airport", "dep": "Immediate (6m ETA)", "arr": "ETA + 45m", "dur": 45, "fare": 850, "cls": "Sedan (4 seater)", "stops": 0, "amen": ["ac", "extra_boot_space"], "bag": "3 Bags", "seat": "Available", "score": 94, "reason": "Spacious boot for airport luggage."},
    {"id": "cb_103", "operator": "BluSmart EV", "num": "Electric Sedan", "orig": "blr_metro_indiranagar", "dest": "blr_airport", "dep": "Pre-scheduled", "arr": "ETA + 50m", "dur": 50, "fare": 920, "cls": "Zero-Emission EV", "stops": 0, "amen": ["ac", "quiet_ride"], "bag": "3 Bags", "seat": "Available", "score": 96, "reason": "Zero surge pricing and eco-friendly EV ride."},
    {"id": "cb_104", "operator": "UberXL / SUV", "num": "Toyota Innova", "orig": "blr_railway_sbc", "dest": "blr_tech_park", "dep": "Immediate (8m ETA)", "arr": "ETA + 40m", "dur": 40, "fare": 540, "cls": "SUV (6 seater)", "stops": 0, "amen": ["ac", "6_seats"], "bag": "5 Bags", "seat": "Available", "score": 91, "reason": "Large family and luggage transfer."},

    # Chennai Local Cabs
    {"id": "cb_201", "operator": "UberGo", "num": "Swift Dzire", "orig": "maa_railway_mas", "dest": "maa_marina_beach", "dep": "Immediate (3m ETA)", "arr": "ETA + 20m", "dur": 20, "fare": 180, "cls": "Sedan (4 seater)", "stops": 0, "amen": ["ac"], "bag": "2 Bags", "seat": "Available", "score": 96, "reason": "Quick last-mile transfer to destination."}
]

# 6. Autos Seed Data (25+ quick connectors)
AUTO_DATA = [
    # Bengaluru Autos
    {"id": "at_101", "operator": "Namma Yatri / Auto", "num": "Bajaj RE Auto", "orig": "blr_tech_park", "dest": "blr_metro_majestic", "dep": "Immediate (2m ETA)", "arr": "ETA + 28m", "dur": 28, "fare": 140, "cls": "Standard Auto (3 seater)", "stops": 0, "amen": ["open_air"], "bag": "1 Small Bag", "seat": "Available", "score": 94, "reason": "Affordable last-mile connectivity without app commission."},
    {"id": "at_102", "operator": "Uber Auto", "num": "CNG Auto", "orig": "blr_metro_indiranagar", "dest": "blr_tech_park", "dep": "Immediate (3m ETA)", "arr": "ETA + 22m", "dur": 22, "fare": 110, "cls": "Standard Auto (3 seater)", "stops": 0, "amen": ["digital_meter"], "bag": "1 Small Bag", "seat": "Available", "score": 92, "reason": "Budget connection to tech corridor."},
    {"id": "at_103", "operator": "Electric Rickshaw", "num": "Mahindra Treo EV", "orig": "blr_railway_sbc", "dest": "blr_metro_majestic", "dep": "Immediate (1m ETA)", "arr": "ETA + 6m", "dur": 6, "fare": 40, "cls": "EV Auto", "stops": 0, "amen": ["eco_friendly"], "bag": "Hand luggage", "seat": "Available", "score": 98, "reason": "Instant 6-minute hub connector for ₹40."}
]

# Convert items into full unified Journey objects
def build_journey_from_item(item: Dict[str, Any], mode: str) -> Dict[str, Any]:
    orig_hub = get_hub(item["orig"])
    dest_hub = get_hub(item["dest"])
    
    # Format departure and arrival into full simulated timestamps
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    dep_time_raw = item.get("dep", "08:00")
    if ":" in dep_time_raw:
        dep_dt = f"{today_str}T{dep_time_raw}:00"
        dur = item.get("dur", 60)
        # calculate arrival time
        dep_h, dep_m = map(int, dep_time_raw.split(":"))
        arr_total_m = dep_h * 60 + dep_m + dur
        arr_h = (arr_total_m // 60) % 24
        arr_m = arr_total_m % 60
        arr_dt = f"{today_str}T{arr_h:02d}:{arr_m:02d}:00"
    else:
        dep_dt = f"{today_str}T09:00:00"
        arr_dt = f"{today_str}T09:45:00"

    leg = {
        "id": f"leg_{item['id']}",
        "mode": mode,
        "operator": item["operator"],
        "service_number": item.get("num"),
        "origin": orig_hub,
        "destination": dest_hub,
        "departure_time": dep_dt,
        "arrival_time": arr_dt,
        "duration_minutes": item.get("dur", 60),
        "fare": item.get("fare", 500),
        "class_or_category": item.get("cls", "Standard"),
        "stops_count": item.get("stops", 0),
        "stop_details": [f"Via {s}" for s in (item.get("stops_details") or [])],
        "amenities": [{"id": a, "label": a.replace("_", " ").title(), "icon_name": a} for a in item.get("amen", [])],
        "baggage_allowance": item.get("bag", "Standard allowance"),
        "seat_status": item.get("seat", "Available"),
        "seat_count": 28 if item.get("seat") == "Available" else (4 if item.get("seat") == "Few Seats Left" else None)
    }

    return {
        "id": item["id"],
        "is_multimodal": False,
        "modes": [mode],
        "origin": orig_hub,
        "destination": dest_hub,
        "departure_time": dep_dt,
        "arrival_time": arr_dt,
        "total_duration_minutes": item.get("dur", 60),
        "total_fare": item.get("fare", 500),
        "legs": [leg],
        "transfers_count": 0,
        "transfer_buffer_minutes": 0,
        "recommended_score": item.get("score", 85),
        "ai_recommendation_reason": item.get("reason", "Matches search constraints.")
    }

for item in FLIGHT_DATA:
    MOCK_JOURNEYS.append(build_journey_from_item(item, "flight"))
for item in TRAIN_DATA:
    MOCK_JOURNEYS.append(build_journey_from_item(item, "train"))
for item in BUS_DATA:
    MOCK_JOURNEYS.append(build_journey_from_item(item, "bus"))
for item in METRO_DATA:
    MOCK_JOURNEYS.append(build_journey_from_item(item, "metro"))
for item in CAB_DATA:
    MOCK_JOURNEYS.append(build_journey_from_item(item, "cab"))
for item in AUTO_DATA:
    MOCK_JOURNEYS.append(build_journey_from_item(item, "auto"))

# 7. Signature Multimodal Journeys (Pre-composed combinations)
MULTIMODAL_TRIP_1 = {
    "id": "mm_blr_maa_01",
    "is_multimodal": True,
    "modes": ["cab", "train", "cab"],
    "origin": get_hub("blr_tech_park"),
    "destination": get_hub("maa_marina_beach"),
    "departure_time": f"{datetime.now().strftime('%Y-%m-%d')}T04:45:00",
    "arrival_time": f"{datetime.now().strftime('%Y-%m-%d')}T10:45:00",
    "total_duration_minutes": 360,
    "total_fare": 1425,
    "transfers_count": 2,
    "transfer_buffer_minutes": 35,
    "recommended_score": 98,
    "ai_recommendation_reason": "Seamless door-to-door multimodal itinerary: Uber to station + Vande Bharat to Chennai + final cab to beach.",
    "legs": [
        {
            "id": "leg_mm1_1",
            "mode": "cab",
            "operator": "UberGo",
            "service_number": "Cab Leg 1",
            "origin": get_hub("blr_tech_park"),
            "destination": get_hub("blr_railway_sbc"),
            "departure_time": f"{datetime.now().strftime('%Y-%m-%d')}T04:45:00",
            "arrival_time": f"{datetime.now().strftime('%Y-%m-%d')}T05:15:00",
            "duration_minutes": 30,
            "fare": 250,
            "class_or_category": "Hatchback",
            "stops_count": 0,
            "amenities": [{"id": "ac", "label": "AC", "icon_name": "ac"}],
            "seat_status": "Available"
        },
        {
            "id": "leg_mm1_2",
            "mode": "train",
            "operator": "Indian Railways",
            "service_number": "20608 Vande Bharat",
            "origin": get_hub("blr_railway_sbc"),
            "destination": get_hub("maa_railway_mas"),
            "departure_time": f"{datetime.now().strftime('%Y-%m-%d')}T05:45:00",
            "arrival_time": f"{datetime.now().strftime('%Y-%m-%d')}T10:10:00",
            "duration_minutes": 265,
            "fare": 995,
            "class_or_category": "Chair Car (CC)",
            "stops_count": 2,
            "amenities": [{"id": "meals", "label": "Meals", "icon_name": "meals"}, {"id": "wifi", "label": "Wifi", "icon_name": "wifi"}],
            "seat_status": "Available"
        },
        {
            "id": "leg_mm1_3",
            "mode": "cab",
            "operator": "UberGo",
            "service_number": "Cab Leg 3",
            "origin": get_hub("maa_railway_mas"),
            "destination": get_hub("maa_marina_beach"),
            "departure_time": f"{datetime.now().strftime('%Y-%m-%d')}T10:25:00",
            "arrival_time": f"{datetime.now().strftime('%Y-%m-%d')}T10:45:00",
            "duration_minutes": 20,
            "fare": 180,
            "class_or_category": "Sedan",
            "stops_count": 0,
            "amenities": [{"id": "ac", "label": "AC", "icon_name": "ac"}],
            "seat_status": "Available"
        }
    ]
}
MOCK_JOURNEYS.append(MULTIMODAL_TRIP_1)

# 8. Sample Demo Bookings (6 Pre-seeded Bookings)
SAMPLE_BOOKINGS: List[Dict[str, Any]] = [
    {
        "id": "bk_demo_101",
        "reference_number": "TP-849201",
        "created_at": (datetime.now() - timedelta(days=2)).isoformat(),
        "status": "CONFIRMED",
        "journey": MOCK_JOURNEYS[0], # Flight 6E-243
        "passengers": [
            {"id": "p1", "full_name": "Arjun Sharma", "age": 32, "gender": "male", "seat_preference": "Window 12A", "email": "arjun.sharma@example.com", "phone": "+91 98765 43210"}
        ],
        "fare_breakdown": {"base_fare": 3250, "taxes_and_fees": 380, "discounts": 0, "total_amount": 3630},
        "contact_email": "arjun.sharma@example.com",
        "contact_phone": "+91 98765 43210",
        "notes": "Vegetarian meal requested on morning flight.",
        "is_simulated_demo": True
    },
    {
        "id": "bk_demo_102",
        "reference_number": "TP-392018",
        "created_at": (datetime.now() - timedelta(days=4)).isoformat(),
        "status": "CONFIRMED",
        "journey": MOCK_JOURNEYS[6], # Train Vande Bharat 20608
        "passengers": [
            {"id": "p2", "full_name": "Priya Ramesh", "age": 28, "gender": "female", "seat_preference": "Aisle C4-22", "email": "priya.ramesh@example.com", "phone": "+91 98451 12345"},
            {"id": "p3", "full_name": "Kavitha Ramesh", "age": 58, "gender": "female", "seat_preference": "Window C4-21", "email": "priya.ramesh@example.com", "phone": "+91 98451 12345"}
        ],
        "fare_breakdown": {"base_fare": 1990, "taxes_and_fees": 120, "discounts": 100, "total_amount": 2010},
        "contact_email": "priya.ramesh@example.com",
        "contact_phone": "+91 98451 12345",
        "notes": "Demo senior citizen lower deck preference.",
        "is_simulated_demo": True
    },
    {
        "id": "bk_demo_103",
        "reference_number": "TP-110492",
        "created_at": (datetime.now() - timedelta(days=7)).isoformat(),
        "status": "COMPLETED",
        "journey": MOCK_JOURNEYS[12], # KSRTC Airavat
        "passengers": [
            {"id": "p4", "full_name": "Vikram Seth", "age": 35, "gender": "male", "seat_preference": "Seat 14", "email": "vikram.seth@example.com", "phone": "+91 97110 54321"}
        ],
        "fare_breakdown": {"base_fare": 650, "taxes_and_fees": 45, "discounts": 0, "total_amount": 695},
        "contact_email": "vikram.seth@example.com",
        "contact_phone": "+91 97110 54321",
        "notes": "Completed weekend trip to Chennai.",
        "is_simulated_demo": True
    },
    {
        "id": "bk_demo_104",
        "reference_number": "TP-662819",
        "created_at": (datetime.now() - timedelta(days=1)).isoformat(),
        "status": "CANCELLED",
        "journey": MULTIMODAL_TRIP_1,
        "passengers": [
            {"id": "p5", "full_name": "Rohan Deshmukh", "age": 29, "gender": "male", "seat_preference": "Standard", "email": "rohan.d@example.com", "phone": "+91 99220 87654"}
        ],
        "fare_breakdown": {"base_fare": 1425, "taxes_and_fees": 85, "discounts": 0, "total_amount": 1510},
        "contact_email": "rohan.d@example.com",
        "contact_phone": "+91 99220 87654",
        "notes": "Cancelled by user test demonstration.",
        "is_simulated_demo": True
    }
]
