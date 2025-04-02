#!/usr/bin/env python3
import argparse
import sys
from datetime import datetime, timedelta
from investiny import historical_data, search_assets

def get_stock_info(symbol: str, days: int = 30) -> None:
    """
    Fetch and display information about a given stock symbol.
    
    Args:
        symbol (str): The stock symbol to look up (e.g., 'AAPL' for Apple)
        days (int): Number of days of historical data to retrieve
    """
    try:
        # Search for the stock
        print(f"\nSearching for {symbol.upper()}...")
        search_results = search_assets(query=symbol, limit=1, type="Stock")
        
        if not search_results:
            print(f"No information found for symbol: {symbol}")
            sys.exit(1)
            
        # Get the investing.com ID
        investing_id = int(search_results[0]["ticker"])
        stock_info = search_results[0]
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Format dates for the API
        from_date = start_date.strftime("%d/%m/%Y")
        to_date = end_date.strftime("%d/%m/%Y")
        
        # Get historical data
        print(f"\nFetching historical data for the last {days} days...")
        historical = historical_data(investing_id=investing_id, from_date=from_date, to_date=to_date)
        
        if not historical:
            print("No historical data available")
            sys.exit(1)
            
        # Print formatted output
        print(f"\nStock Information for {symbol.upper()}:")
        print("-" * 50)
        
        # Basic Information
        print("\nBasic Information:")
        print(f"Company Name: {stock_info.get('name', 'N/A')}")
        print(f"Exchange: {stock_info.get('exchange', 'N/A')}")
        print(f"Type: {stock_info.get('type', 'N/A')}")
        
        # Latest Price Information
        latest_data = historical[-1]
        print("\nLatest Price Information:")
        print(f"Price: ${latest_data.get('close', 'N/A')}")
        print(f"Open: ${latest_data.get('open', 'N/A')}")
        print(f"High: ${latest_data.get('high', 'N/A')}")
        print(f"Low: ${latest_data.get('low', 'N/A')}")
        print(f"Volume: {latest_data.get('volume', 'N/A')}")
        
        # Historical Summary
        print(f"\nHistorical Summary (Last {days} days):")
        prices = [float(data.get('close', 0)) for data in historical]
        if prices:
            print(f"Starting Price: ${prices[0]:.2f}")
            print(f"Ending Price: ${prices[-1]:.2f}")
            price_change = prices[-1] - prices[0]
            price_change_pct = (price_change / prices[0]) * 100
            print(f"Price Change: ${price_change:.2f} ({price_change_pct:.2f}%)")
            print(f"Highest Price: ${max(prices):.2f}")
            print(f"Lowest Price: ${min(prices):.2f}")
        
    except Exception as e:
        print(f"Error fetching information for {symbol}: {str(e)}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Fetch stock information using Investiny')
    parser.add_argument('symbol', help='Stock symbol to look up (e.g., AAPL)')
    parser.add_argument('--days', type=int, default=30, help='Number of days of historical data to retrieve (default: 30)')
    
    args = parser.parse_args()
    get_stock_info(args.symbol, args.days)

if __name__ == '__main__':
    main()
