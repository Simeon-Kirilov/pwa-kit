# Task: Implement "Quick View" Functionality on Product Listing Page (PLP) in PWA Kit for Salesforce Commerce Cloud (SFCC)

**Objective:** Enhance the Product Tile on the PLP by adding a "Quick View" button that appears when the mouse hovers over the product image. The button should be overlayed on the image and should allow users to quickly view product details without leaving the PLP.

## Requirements
1. **Environment Setup:**
   - Clone this repository.
   - Set up project by
   		- switching to Node 18
   		- running `npm install`
   		- running `npm start`
   - SFCC backend is already configured and connected - should be running correctly with the current settings.

2. **Modify the Product Tile Component:**
   - Locate the Product Tile component in the PWA Kit codebase. This is typically found in a component library folder, e.g., `app/components/product-tile`.

3. **Add the "Quick View" Button:**
   - Implement a button that appears when the user hovers over the product image.
   - The button should be styled to overlay the image with text "Quick View".
   - Use CSS for the hover effect and ensure the button is positioned correctly.

4. **Quick View Modal:**
   - Create a modal or a popup component that will display product details.
   - This component should be invoked when the "Quick View" button is clicked.
   - The modal should include essential product details such as name, price, short description, and image.
   - The variation selections and Add to Bag buttons should be available and working as expected adding the product to the basket.
   - The modal should contain data similar to the PDP (Product details page)
   		- Product Image
		- Product Price
		- Product Description
		- Variation Selection
		- Quantity Selector
		- Add to Cart Button
		- Add to Wishlist Button
		- Close Button

   ![QuickView](QuickView.png)
   
5. **Fetch Product Details:**
   - Ensure the modal fetches the correct product details from the backend.
   - Use SFCC APIs to get the product information.

6. **Responsive Design:**
   - Ensure that the "Quick View" functionality is responsive and works well on different screen sizes for all breakpoints available.

## Submission Instructions

1. **Fork the Repository:**
   - Create a fork of the PWA Kit repository into your own **private** GitHub repository.
3. **Verify Functionality:**
   - Ensure that all implemented features work correctly and are thoroughly tested.
4. **Document Your Work:**
   - Provide a brief documentation file detailing your implementation process, any challenges faced, and how you resolved them.
5. **Video Demonstration:**
   - Record a short video demonstrating the "Quick View" functionality in action.
6. **Grant Access:**
   - Once the task is complete, give access to your private repository to the GitHub user `k2kirov` for review.
7. **Submit Links by e-mail:**
   - Submit the link to your private repository.
   - Submit the link to the video demonstration.

By following these instructions, you will ensure that your task is correctly reviewed and evaluated.

## Resources
- Refer to README.md for details on the project setup

---

