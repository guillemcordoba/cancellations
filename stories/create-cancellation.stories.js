import { html } from "lit-html";
import "@holochain-open-dev/cancellations/elements/create-cancellation.js";
import "@holochain-open-dev/cancellations/elements/cancellations-context.js";
import { CancellationsZomeMock } from "@holochain-open-dev/cancellations/dist/mocks.js";
import { CancellationsStore, CancellationsClient } from "@holochain-open-dev/cancellations";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/web-components/writing-stories/introduction
export default {
  title: "Frontend/Elements/create-cancellation",
  tags: ["autodocs"],
  component: "create-cancellation",
  render: (args) =>
    html` <cancellations-context
      .store=${new CancellationsStore(new CancellationsClient(new CancellationsZomeMock()))}
    >
      <create-cancellation></create-cancellation>
    </cancellations-context>`,
};

// More on writing stories with args: https://storybook.js.org/docs/7.0/web-components/writing-stories/args
export const Demo = {};
