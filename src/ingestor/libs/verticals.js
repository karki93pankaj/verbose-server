export const verticalArray = [
  {
    name: 'Bad Credit',
    slug: 'bad-credit',
  },
  {
    name: 'Credit Cards',
    slug: 'credit-cards',
  },
  {
    name: 'Car Loans',
    slug: 'car-loans',
  },
  {
    name: 'Home Loans',
    slug: 'home-loans',
  },
  {
    name: 'Managed Funds',
    slug: 'managed-funds',
  },
  {
    name: 'Online Trading',
    slug: 'online-trading',
  },
  {
    name: 'Pension Funds',
    slug: 'pension-funds',
  },
  {
    name: 'Personal Loans',
    slug: 'personal-loans',
  },
  {
    name: 'Savings Accounts',
    slug: 'savings-accounts',
  },
  {
    name: 'Superannuation',
    slug: 'superannuation',
  },
  {
    name: 'Bank Accounts',
    slug: 'bank-accounts',
  },
  {
    name: 'Transaction Accounts',
    slug: 'transaction-accounts',
  },
  {
    name: 'Term Deposits',
    slug: 'term-deposits',
  },
  {
    name: 'Car Insurance',
    slug: 'car-insurance',
  },
  {
    name: 'Health Insurance',
    slug: 'health-insurance',
  },
  {
    name: 'Foreign Exchange',
    slug: 'foreign-exchange',
  },
  {
    name: 'Margin Loans',
    slug: 'margin-loans',
  },
  {
    name: 'Home Insurance',
    slug: 'home-insurance',
  },
  {
    name: 'Mortgage Insurance',
    slug: 'mortgage-insurance',
  },
  {
    name: 'Display',
    slug: 'display',
  },
  {
    name: 'Sale Event Product',
    slug: 'sale-event-product',
  },
  {
    name: 'Investment Funds',
    slug: 'investment-funds',
  },
  {
    name: 'nonspecific',
    slug: 'nonspecific',
  },
  {
    name: 'Health Product',
    slug: 'health-product',
  },
  {
    name: 'Income Protection Insurance',
    slug: 'income-protection-insurance',
  },
  {
    name: 'Life Insurance',
    slug: 'life-insurance',
  },
  {
    name: 'Health Insurance',
    slug: 'health-insurance',
  },
  {
    name: 'Foreign Exchange',
    slug: 'foreign-exchange',
  },
  {
    name: 'Infographic',
    slug: 'infographic',
  },
  {
    name: 'Travel Cards',
    slug: 'travel-cards',
  },
  {
    name: 'Payday Loans',
    slug: 'payday-loans',
  },
  {
    name: 'Homeloan Sale',
    slug: 'sale',
  },
  {
    name: 'Reverse Mortgages',
    slug: 'reverse-mortgages',
  },
]

export const verticals = verticalArray.reduce((obj, v) => {
  obj[v.slug] = v
  return obj
}, {})

export function getVerticalName (verticalSlug) {
  let vertical = verticals[verticalSlug]
  if (vertical) {
    return vertical.name
  }
  return ''
}