import React from "react";

export const columns = [
  {
    title: "No",
    dataIndex: "index",
    key: "index",
    width: 80,
    render: (text, record, index) => index + 1, // Renders the row number
  },
  {
    title: "Epic",
    dataIndex: "epic",
    key: "epic",
    width: 400,
  },
  {
    title: "User Stories",
    dataIndex: "user_story",
    key: "user_story",
    width: 700,
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    width: 600,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 90,
  },
];

export const prioritizedColumns = [
  {
    title: "No",
    dataIndex: "index",
    key: "index",
    width: 80,
    render: (text, record, index) => index + 1, // Renders the row number
  },
  {
    title: "Old No",
    dataIndex: "ID",
    key: "ID",
    width: 80,
  },
  {
    title: "Epic",
    dataIndex: "epic",
    key: "epic",
    width: 500,
  },
  {
    title: "User Stories",
    dataIndex: "user_story",
    key: "user_story",
    width: 700,
  },
];

export const finalOutputColumns = [
  {
    title: "Epic",
    dataIndex: "epic",
    key: "epic",
  },
  {
    title: "User Story",
    dataIndex: "user_story",
    key: "user_story",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Number",
    dataIndex: "number",
    key: "number",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Key",
    dataIndex: "key",
    key: "key",
  },
  {
    title: "Dollar Allocation",
    dataIndex: "dollar_allocation",
    key: "dollar_allocation",
  },
];


export const wsjfColumns = [
  {
    title: "Epic",
    dataIndex: "epic",
    key: "epic",
  },
  {
    title: "User Story",
    dataIndex: "user_story",
    key: "user_story",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Business Value (BV)",
    dataIndex: "bv",
    key: "BV",
  },
  {
    title: "Time Criticality (TC)",
    dataIndex: "tc",
    key: "TC",
  },
  {
    title: "Risk Reduction/Opportunity Enablement (RR/OE)",
    dataIndex: "oe",
    key: "RR/OE",
  },
  {
    title: "Job Size (JS)",
    dataIndex: "js",
    key: "JS",
  },
  {
    title: "WSJF Score",
    dataIndex: "wsjf_score",
    key: "wsjf_score",
  },
];

// Define columns for your table
export const testCasesColumns = [
  {
    title: "Test Case Suite No",
    dataIndex: "suite_number",
    key: "suite_number",
    width: 120,
  },
  {
    title: "Scenario",
    dataIndex: "scenario",
    key: "scenario",
  },
  {
    title: "Input",
    dataIndex: "input",
    key: "input",
  },
  {
    title: "Expected Output",
    dataIndex: "expected_output",
    key: "expected_output",
  },
];
