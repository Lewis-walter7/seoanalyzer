// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import Page from "./page";

// // Mock the Chart component since it requires canvas
// jest.mock('@/components/ChartComponent', () => ({
//   ChartComponent: ({ data, type }: any) => (
//     <div data-testid="chart-component">
//       Chart Component - Type: {type}, Datasets: {data.datasets.length}
//     </div>
//   )
// }));

// // Mock fetch
// global.fetch = jest.fn();

// describe("Rank Tracker Page", () => {
//   beforeEach(() => {
//     (fetch as jest.Mock).mockClear();
//   });

//   it("renders the rank tracker form", () => {
//     render(<Page />);

//     expect(screen.getByText("Rank Tracker Tool")).toBeInTheDocument();
//     expect(screen.getByLabelText(/domain url/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/keywords/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/search engine/i)).toBeInTheDocument();
//     expect(screen.getByRole("button", { name: /track rankings/i })).toBeInTheDocument();
//   });

//   it("requires domain and keywords to be filled", async () => {
//     render(<Page />);

//     // Test empty form submission
//     const submitButton = screen.getByRole("button", { name: /track rankings/i });
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(screen.getByText("Please enter a valid domain.")).toBeInTheDocument();
//     });

//     // Test with domain but no keywords
//     const domainInput = screen.getByLabelText(/domain url/i);
//     fireEvent.change(domainInput, { target: { value: "https://example.com" } });
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(screen.getByText("Please enter at least one keyword.")).toBeInTheDocument();
//     });
//   });

//   it("successfully submits form and displays results", async () => {
//     const mockResponse = {
//       domain: "https://example.com",
//       searchEngine: "google",
//       results: [
//         {
//           keyword: "seo",
//           currentPosition: 5,
//           previousPosition: 8,
//           change: 3,
//           url: "https://example.com/page-for-seo",
//           searchEngine: "google",
//           lastChecked: "2023-10-01T00:00:00Z",
//         }
//       ],
//       totalKeywords: 1,
//       averagePosition: 5,
//       positionsImproved: 1,
//       positionsDeclined: 0,
//       chartData: {
//         labels: ["7 days ago", "Today"],
//         datasets: [
//           { label: "seo", data: [8, 5], keyword: "seo" }
//         ],
//       },
//     };

//     (fetch as jest.Mock).mockResolvedValueOnce({
//       ok: true,
//       json: async () => mockResponse,
//     });

//     render(<Page />);

//     // Fill form
//     fireEvent.change(screen.getByLabelText(/domain url/i), { 
//       target: { value: "https://example.com" } 
//     });
//     fireEvent.change(screen.getByLabelText(/keywords/i), { 
//       target: { value: "seo" } 
//     });

//     // Submit
//     fireEvent.click(screen.getByRole("button", { name: /track rankings/i }));

//     // Wait for results
//     await waitFor(() => {
//       expect(screen.getByText("Current Rankings")).toBeInTheDocument();
//     }, { timeout: 3000 });

//     // Verify results are displayed
//     expect(screen.getByText("seo")).toBeInTheDocument();
//     expect(screen.getByText("Total Keywords")).toBeInTheDocument();
//     expect(screen.getByTestId("chart-component")).toBeInTheDocument();
//   });

//   it("handles API error gracefully", async () => {
//     (fetch as jest.Mock).mockResolvedValueOnce({
//       ok: false,
//       json: async () => ({ error: "Invalid domain format" }),
//     });

//     render(<Page />);

//     fireEvent.change(screen.getByLabelText(/domain url/i), { 
//       target: { value: "invalid-domain" } 
//     });
//     fireEvent.change(screen.getByLabelText(/keywords/i), { 
//       target: { value: "seo" } 
//     });
//     fireEvent.click(screen.getByRole("button", { name: /track rankings/i }));

//     await waitFor(() => {
//       expect(screen.getByText("Invalid domain format")).toBeInTheDocument();
//     });
//   });

//   it("disables form during loading", () => {
//     (fetch as jest.Mock).mockImplementationOnce(() => 
//       new Promise(() => {}) // Never resolves to keep loading state
//     );

//     render(<Page />);

//     fireEvent.change(screen.getByLabelText(/domain url/i), { 
//       target: { value: "https://example.com" } 
//     });
//     fireEvent.change(screen.getByLabelText(/keywords/i), { 
//       target: { value: "seo" } 
//     });
//     fireEvent.click(screen.getByRole("button", { name: /track rankings/i }));

//     // Check form is disabled during loading
//     expect(screen.getByLabelText(/domain url/i)).toBeDisabled();
//     expect(screen.getByLabelText(/keywords/i)).toBeDisabled();
//     expect(screen.getByRole("button", { name: /tracking rankings/i })).toBeDisabled();
//   });

//   it("allows selection of different search engines", () => {
//     render(<Page />);

//     const searchEngineSelect = screen.getByLabelText(/search engine/i);
    
//     // Check default value
//     expect(searchEngineSelect).toHaveValue("google");
    
//     // Test changing values
//     fireEvent.change(searchEngineSelect, { target: { value: "bing" } });
//     expect(searchEngineSelect).toHaveValue("bing");
    
//     fireEvent.change(searchEngineSelect, { target: { value: "yahoo" } });
//     expect(searchEngineSelect).toHaveValue("yahoo");
//   });
// });
