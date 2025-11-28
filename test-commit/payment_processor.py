def process_payment(user_id, amount):
    # BUG 1: No type checking
    # BUG 2: SQL injection vulnerability
    query = f"SELECT * FROM accounts WHERE user_id = {user_id}"
    account = db.execute(query)
    
    # BUG 3: Integer overflow possible
    new_balance = account.balance - amount
    
    # BUG 4: No transaction handling
    db.execute(f"UPDATE accounts SET balance = {new_balance} WHERE user_id = {user_id}")
    
    # BUG 5: Hardcoded API key
    api_key = "sk_live_1234567890"
    
    # BUG 6: No error handling for external API
    result = requests.post(
        "https://payment-api.com/charge",
        json={"amount": amount},
        headers={"Authorization": api_key}
    )
    
    # BUG 7: Not checking response status
    return result.json()

# BUG 8: Global mutable state
transaction_log = []

def log_transaction(transaction):
    # BUG 9: Race condition in multi-threaded environment
    transaction_log.append(transaction)

# BUG 10: Using eval() - code injection risk
def calculate_discount(expression):
    return eval(expression)

# BUG 11: No input validation
def send_email(email, message):
    os.system(f"mail -s 'Notification' {email} <<< {message}")
