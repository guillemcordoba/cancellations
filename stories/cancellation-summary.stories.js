import { html } from "lit-html";
import "@holochain-open-dev/cancellations/elements/cancellation-summary.js";
import "@holochain-open-dev/cancellations/elements/cancellations-context.js";
import { CancellationsZomeMock, sampleCancellation } from "@holochain-open-dev/cancellations/dist/mocks.js";
import { CancellationsStore, CancellationsClient } from "@holochain-open-dev/cancellations";

const mock = new CancellationsZomeMock();
const client = new CancellationsClient(mock);

const record = await mock.create_cancellation(await sampleCancellation(client));

const store = new CancellationsStore(client);

// More on how to set up stories at: https://storybook.js.org/docs/7.0/web-components/writing-stories/introduction
export default {
  title: "Frontend/Elements/cancellation-summary",
  tags: ["autodocs"],
  component: "cancellation-summary",
  render: (args) =>
    html` <cancellations-context
      .store=${store}
    >
      <cancellation-summary .cancellationHash=${record.signed_action.hashed.hash}></cancellation-summary>
    </cancellations-context>`,
};

// More on writing stories with args: https://storybook.js.org/docs/7.0/web-components/writing-stories/args
export const Demo = {};
