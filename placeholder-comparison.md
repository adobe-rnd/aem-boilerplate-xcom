# Placeholder Files Comparison Report

This document compares the old placeholder files of release 0.4.0 with the updated placeholder files.

---

## account placeholder

### Deleted Entries
None

### Changed Entries

None

### New Entries (CSV format)
None

---

## auth placeholder

### Deleted Entries
None

### Changed Entries

| Key | Old Value | New Value |
|-----|-----------|-----------|
| Auth.FormText.urlError | Please enter a valid URL e.g. https://www.website.com. | Please enter a valid URL, e.g. https://www.website.com. |


### New Entries (CSV format)
None

---

## cart placeholder

### Deleted Entries
None

### Changed Entries
None

### New Entries (CSV format)
None

---

## checkout placeholder

### Deleted Entries
None

### Changed Entries
None

### New Entries (CSV format)
None

---

## global placeholder

### Deleted Entries
None

### Changed Entries
None

### New Entries (CSV format)
None

---

## order placeholder

### Deleted Entries
None

### Changed Entries
None

### New Entries (CSV format)
None

---

## payment-services placeholder

### Notes
This is a **NEW FILE** with no old version to compare against.

### All Entries (CSV format)

```csv
Key,Value
PaymentServices.CreditCard.formFields.cvv.invalidError,Enter valid cvv.
PaymentServices.CreditCard.formFields.cvv.label,
PaymentServices.CreditCard.formFields.cvv.missingError,This field is required.
PaymentServices.CreditCard.formFields.cvv.placeholder,CVV*
PaymentServices.CreditCard.formFields.expirationDate.invalidError,Enter valid expiration date.
PaymentServices.CreditCard.formFields.expirationDate.label,
PaymentServices.CreditCard.formFields.expirationDate.missingError,This field is required.
PaymentServices.CreditCard.formFields.expirationDate.placeholder,MM/YY*
PaymentServices.CreditCard.formFields.number.invalidError,Enter valid card number.
PaymentServices.CreditCard.formFields.number.label,
PaymentServices.CreditCard.formFields.number.missingError,This field is required.
PaymentServices.CreditCard.formFields.number.placeholder,Card number*
PaymentServices.CreditCard.messages.methodNotAvailable,Payment method not available. Please contact support.
PaymentServices.CreditCard.messages.methodNotLoaded,Failed to load payment method. Please try again later.
```

---

## pdp placeholder

### Deleted Entries
None

### Changed Entries
None

### New Entries (CSV format)
None

---

## recommendations placeholder

### Deleted Entries
None

### Changed Entries
None

### New Entries (CSV format)
None

---

## search placeholder

### Deleted Entries

| Key |
|-----|
| Search.PLP.SortDropdown.sortASC |
| Search.PLP.SortDropdown.productName |
| Search.SearchInput.viewAllButton |
| Search.PLP.SortDropdown.positionLabel |
| Search.PLP.SortDropdown.relevanceLabel |
| Search.ResultsInfo.products |
| Search.PLP.SortDropdown.title |
| Search.PLP.SortDropdown.sortAttributeDESC |
| Search.PLP.SortDropdown.productLowStock |
| Search.PLP.SortDropdown.productInStock |
| Search.PLP.SortDropdown.option |
| Search.ResultsInfo.resultsFor |
| Search.PLP.SortDropdown.sortAttributeASC |
| Search.PLP.Warning.minQueryLength |
| Search.SearchInput.placeholder |
| Search.PLP.SortDropdown.sortDESC |

### Changed Entries

| Old Key | Old Value | New Key | New Value |
|---------|-----------|---------|-----------|
| Search.PLP.Warning.noResults | Your search returned no results. | Search.PLP.noResults | Your search returned no results. |
| Search.PLP.Warning.searchError | An error occurred while searching. | Search.PLP.searchError | An error occurred while searching. |
| Search.Facet.showMore | Show more | Search.Facet.showMore | Show More |
| Search.Facet.showLess | Show less | Search.Facet.showLess | Show Less |
| Search.Facet.clearAll | Clear all | Search.Facet.clearAll | Clear All |

### New Entries (CSV format)

```csv
Key,Value
Search.SortBy.title,Sort By
Search.SortBy.lowToHigh,Low to High
Search.SortBy.highToLow,High to Low
```

---

## wishlist placeholder

### Deleted Entries
None

### Changed Entries
None

### New Entries (CSV format)
None
