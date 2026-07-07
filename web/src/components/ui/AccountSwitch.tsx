type AccountType = 'buyer' | 'organizer';

type AccountSwitchProps = {
    accountType: AccountType;
    setAccountType: (type: AccountType) => void;
};

export function AccountSwitch({ accountType, setAccountType }: AccountSwitchProps) {
    return (
        <div className="mb-8 grid grid-cols-2 gap-2 rounded-full border border-border bg-background p-1">
            <button
                type="button"
                onClick={() => setAccountType('buyer')}
                className={`rounded-full px-4 py-2.5 text-sm font-black transition ${accountType === 'buyer'
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted hover:text-primary'
                    }`}
            >
                Buyer
            </button>

            <button
                type="button"
                onClick={() => setAccountType('organizer')}
                className={`rounded-full px-4 py-2.5 text-sm font-black transition ${accountType === 'organizer'
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted hover:text-primary'
                    }`}
            >
                Organizer
            </button>
        </div>
    );
}
