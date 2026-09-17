using Application.DTOs.Author;
using Application.DTOs.Book;
using Application.DTOs.BookCopy;
using Application.DTOs.BorrowRecord;
using Application.DTOs.Category;
using Application.DTOs.Publisher;
using Application.DTOs.User;
using AutoMapper;
using Domain.Entities;

namespace Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Author, AuthorDto>();
        CreateMap<CreateAuthorDto, Author>();
        CreateMap<UpdateAuthorDto, Author>();

        CreateMap<Publisher, PublisherDto>();
        CreateMap<CreatePublisherDto, Publisher>();
        CreateMap<UpdatePublisherDto, Publisher>();

        CreateMap<Category, CategoryDto>();
        CreateMap<CreateCategoryDto, Category>();
        CreateMap<UpdateCategoryDto, Category>();

        CreateMap<Book, BookDto>()
            .ForMember(dest => dest.PublisherName, opt => opt.MapFrom(src => src.Publisher != null ? src.Publisher.Name : string.Empty))
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
            .ForMember(dest => dest.AuthorNames, opt => opt.MapFrom(src => src.BookAuthors.Select(ba => ba.Author!.FullName)));
        CreateMap<CreateBookDto, Book>();
        CreateMap<UpdateBookDto, Book>();

        CreateMap<BookCopy, BookCopyDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Book != null ? src.Book.Title : string.Empty));
        CreateMap<CreateBookCopyDto, BookCopy>();

        CreateMap<User, UserDto>();

        CreateMap<BorrowRecord, BorrowRecordDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.BookCopy != null && src.BookCopy.Book != null ? src.BookCopy.Book.Title : string.Empty))
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : string.Empty));
    }
}
