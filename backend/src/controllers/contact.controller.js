import {
  createUserContact,
  deleteUserContact,
  getUserContactById,
  getUserContacts,
  updateUserContact
} from "../services/contact.service.js";

async function getContacts(request, response, next) {
  try {
    const contacts = await getUserContacts(request.user.id);

    response.status(200).json({
      success: true,
      message: "Contacts retrieved successfully.",
      data: {
        contacts
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getContact(request, response, next) {
  try {
    const contact = await getUserContactById(request.user.id, request.params.id);

    if (!contact) {
      return response.status(404).json({
        success: false,
        message: "Contact not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Contact retrieved successfully.",
      data: {
        contact
      }
    });
  } catch (error) {
    next(error);
  }
}

async function createContact(request, response, next) {
  try {
    const contact = await createUserContact(
      request.user.id,
      request.body.contactData
    );

    response.status(201).json({
      success: true,
      message: "Contact created successfully.",
      data: {
        contact
      }
    });
  } catch (error) {
    next(error);
  }
}

async function updateContact(request, response, next) {
  try {
    const contact = await updateUserContact(
      request.user.id,
      request.params.id,
      request.body.contactData
    );

    if (!contact) {
      return response.status(404).json({
        success: false,
        message: "Contact not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Contact updated successfully.",
      data: {
        contact
      }
    });
  } catch (error) {
    next(error);
  }
}

async function deleteContact(request, response, next) {
  try {
    const contact = await deleteUserContact(request.user.id, request.params.id);

    if (!contact) {
      return response.status(404).json({
        success: false,
        message: "Contact not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Contact deleted successfully.",
      data: {
        contact
      }
    });
  } catch (error) {
    next(error);
  }
}

export {
  createContact,
  deleteContact,
  getContact,
  getContacts,
  updateContact
};
