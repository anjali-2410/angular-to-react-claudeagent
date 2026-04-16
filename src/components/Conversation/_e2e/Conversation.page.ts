import { Locator, Page } from '@playwright/test';

/**
 * ConversationPrompt E2E page object — converted from conversation-prompt.page.ts.
 * CSS selectors identical to Angular source.
 */
export class ConversationPromptPage {
  static DEFAULT_TIMEOUT = 2_000;

  textAreaInputSelector = '.prompt-container .prompt-wrapper .input-container .sol-conversation-textarea';
  submitButtonSelector = '.prompt-container .submit-btn-container .sol-button';
  characterCountSelector = '.character-counter';
  crossIconSelector = '.prompt-container .inner-actions-container .clear-icon';
  pixieIconSelector = '.prompt-container .inner-actions-container .pixie-icon';
  solConversationCardSelector = '.sol-conversation';
  addResponseBtnSelector = '.response-btn';
  solConversationQuestionCard = '.sol-conversation .sol-conversation-question';
  suggestionMenuSelector = '.sol-suggestion-menu-box';
  suggestionItemsSelector = '.sol-suggestion-menu-box .sol-menu-item';

  submitButton: Locator;
  textAreaInput: Locator;
  characterCount: Locator;
  crossIcon: Locator;
  pixieIcon: Locator;
  solConversation: Locator;
  responsebtn: Locator;
  questionCard: Locator;
  suggestionMenu: Locator;

  constructor(private page: Page) {
    this.submitButton = page.locator(this.submitButtonSelector);
    this.textAreaInput = page.locator(this.textAreaInputSelector);
    this.characterCount = page.locator(this.characterCountSelector);
    this.crossIcon = page.locator(this.crossIconSelector);
    this.pixieIcon = page.locator(this.pixieIconSelector);
    this.solConversation = page.locator(this.solConversationCardSelector);
    this.responsebtn = page.locator(this.addResponseBtnSelector);
    this.questionCard = page.locator(this.solConversationQuestionCard);
    this.suggestionMenu = page.locator(this.suggestionMenuSelector);
  }

  async clickSendButton(selector: string, force = false, _timeout = ConversationPromptPage.DEFAULT_TIMEOUT): Promise<void> {
    return await this.page.locator(selector).click({ force });
  }

  async typeInPrompt(text: string): Promise<void> {
    await this.textAreaInput.fill(text);
  }

  async clickPixieButton(): Promise<void> {
    await this.page.locator(`${this.pixieIconSelector} button`).click();
  }

  async clickSuggestion(index: number): Promise<void> {
    await this.page.locator(this.suggestionItemsSelector).nth(index).click();
  }

  async isSuggestionMenuVisible(): Promise<boolean> {
    return await this.suggestionMenu.isVisible();
  }
}
